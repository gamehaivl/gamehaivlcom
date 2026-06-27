/* Static GitHub Pages controller */
(function () {
  "use strict";

  const VND_FORMAT = new Intl.NumberFormat("vi-VN");

  function qs(selector, root = document) {
    return root.querySelector(selector);
  }

  function qsa(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function parseCsvNumbers(value) {
    if (!value || typeof value !== "string") return [];
    return value.split(",").map((item) => Number(String(item).trim())).filter(Number.isFinite);
  }

  function parseCsvDates(value) {
    if (!value || typeof value !== "string") return [];
    return value.split(",").map((raw) => {
      const item = String(raw).trim();
      const parts = item.match(/^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/);
      if (!parts) return null;
      const [, dd, mm, yyyy, hh, mi, ss] = parts;
      return {
        time: `${yyyy}-${mm}-${dd}`,
        label: `${dd}/${mm}`,
        timestamp: new Date(`${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}+07:00`).getTime()
      };
    }).filter(Boolean);
  }

  function getGoldData(rangeKey) {
    const dates = parseCsvDates(window.labelGold || "");
    const buy = parseCsvNumbers(window.buyGold || "");
    const sell = parseCsvNumbers(window.sellGold || "");
    const len = Math.min(dates.length, buy.length, sell.length);

    let points = [];
    for (let i = 0; i < len; i += 1) {
      points.push({
        time: dates[i].time,
        label: dates[i].label,
        timestamp: dates[i].timestamp,
        buy: buy[i],
        sell: sell[i]
      });
    }

    const rangeMap = {
      "1d": 2,
      "7d": 14,
      "30d": 90,
      "6m": 180,
      "1y": 365,
      "2y": 730,
      "5y": 1825,
      "10y": 3650,
      "15y": 5475
    };

    const maxPoints = rangeMap[rangeKey] || rangeMap["30d"];
    if (points.length > maxPoints) points = points.slice(-maxPoints);
    return points;
  }

  function updateStats(points) {
    if (!points.length) return;
    const allPrices = points.flatMap((point) => [point.buy, point.sell]).filter(Number.isFinite);
    const current = points[points.length - 1];

    const min = Math.min(...allPrices);
    const max = Math.max(...allPrices);
    const avg = allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length;

    const setText = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = VND_FORMAT.format(Math.round(value));
    };

    setText("goldStatMin", min);
    setText("goldStatMax", max);
    setText("goldStatAvg", avg);
    setText("goldStatCurrent", current.sell);
  }

  let mainChart;
  let navigatorChart;
  let modalChart;

  function drawLightweightChart(container, points, options = {}) {
    if (!container || !points.length || !window.LightweightCharts) return null;

    container.innerHTML = "";

    const chart = LightweightCharts.createChart(container, {
      width: container.clientWidth || 600,
      height: options.height || container.clientHeight || 320,
      layout: {
        background: { color: "#ffffff" },
        textColor: "#334155"
      },
      grid: {
        vertLines: { color: "#f1f5f9" },
        horzLines: { color: "#f1f5f9" }
      },
      rightPriceScale: {
        borderColor: "#e2e8f0"
      },
      timeScale: {
        borderColor: "#e2e8f0",
        timeVisible: false
      },
      localization: {
        priceFormatter: (price) => VND_FORMAT.format(Math.round(price))
      }
    });

    const buySeries = chart.addLineSeries({
      title: "Mua vào",
      color: "#059669",
      lineWidth: 2,
      priceLineVisible: false
    });

    const sellSeries = chart.addLineSeries({
      title: "Bán ra",
      color: "#dc2626",
      lineWidth: 2,
      priceLineVisible: false
    });

    buySeries.setData(points.map((point) => ({ time: point.time, value: point.buy })));
    sellSeries.setData(points.map((point) => ({ time: point.time, value: point.sell })));

    chart.timeScale().fitContent();

    const resize = () => {
      if (!document.body.contains(container)) return;
      chart.applyOptions({
        width: container.clientWidth || 600,
        height: options.height || container.clientHeight || 320
      });
    };
    window.addEventListener("resize", resize, { passive: true });

    return chart;
  }

  function drawMainChart(range = window.goldChartHistoryTimeKey || "30d") {
    const points = getGoldData(range);
    const container = document.getElementById("goldChartCanvas");
    const navigator = document.getElementById("goldLwNavigatorChartWrap");

    updateStats(points);

    if (mainChart && typeof mainChart.remove === "function") mainChart.remove();
    mainChart = drawLightweightChart(container, points, { height: 420 });

    if (navigator) {
      if (navigatorChart && typeof navigatorChart.remove === "function") navigatorChart.remove();
      navigatorChart = drawLightweightChart(navigator, points, { height: 80 });
    }
  }

  function initTimeRangeButtons() {
    const buttons = qsa(".gold-time-range-btn");
    const mobileLabel = qs(".gold-time-range-mobile-label");
    const panel = qs(".gold-time-range-mobile-panel");
    const trigger = qs(".gold-time-range-mobile-trigger");
    const chevron = qs(".gold-time-range-mobile-chevron");

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const range = button.getAttribute("data-time") || "30d";

        buttons.forEach((btn) => {
          const active = btn.getAttribute("data-time") === range;
          btn.setAttribute("aria-pressed", active ? "true" : "false");
          btn.classList.toggle("bg-white", active);
          btn.classList.toggle("text-slate-900", active);
          btn.classList.toggle("shadow-sm", active);
        });

        if (mobileLabel) mobileLabel.textContent = button.textContent.trim();
        if (panel) panel.classList.remove("is-open");
        if (chevron) chevron.classList.remove("is-open");
        if (trigger) trigger.setAttribute("aria-expanded", "false");

        drawMainChart(range);
      });
    });

    if (trigger && panel) {
      trigger.addEventListener("click", () => {
        const isOpen = panel.classList.toggle("is-open");
        trigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
        if (chevron) chevron.classList.toggle("is-open", isOpen);
      });
    }

    document.addEventListener("click", (event) => {
      if (!panel || !trigger) return;
      if (!panel.contains(event.target) && !trigger.contains(event.target)) {
        panel.classList.remove("is-open");
        trigger.setAttribute("aria-expanded", "false");
        if (chevron) chevron.classList.remove("is-open");
      }
    });
  }

  function initMobileMenu() {
    const button = document.getElementById("menu-button");
    const menu = document.getElementById("mobileMenu");
    const close = document.getElementById("mobileMenuClose");
    const backdrop = document.getElementById("backdrop");

    const openMenu = () => {
      if (!menu) return;
      menu.classList.add("is-open");
      menu.classList.remove("-translate-x-full");
      menu.classList.add("translate-x-0");
      if (backdrop) {
        backdrop.classList.add("is-open");
        backdrop.classList.remove("hidden");
      }
      document.body.style.overflow = "hidden";
    };

    const closeMenu = () => {
      if (!menu) return;
      menu.classList.remove("is-open");
      menu.classList.add("-translate-x-full");
      menu.classList.remove("translate-x-0");
      if (backdrop) {
        backdrop.classList.remove("is-open");
        backdrop.classList.add("hidden");
      }
      document.body.style.overflow = "";
    };

    if (button) button.addEventListener("click", openMenu);
    if (close) close.addEventListener("click", closeMenu);
    if (backdrop) backdrop.addEventListener("click", closeMenu);

    qsa("[data-submenu-toggle]").forEach((toggle) => {
      toggle.addEventListener("click", (event) => {
        const link = event.target.closest("a");
        if (link && link.getAttribute("href")) return;

        const targetId = toggle.getAttribute("data-submenu-toggle");
        const submenu = document.getElementById(targetId);
        const icon = toggle.querySelector("svg");
        if (!submenu) return;

        submenu.classList.toggle("hidden");
        submenu.classList.toggle("flex");
        if (icon) icon.classList.toggle("rotate-180");
      });
    });
  }

  function initSearchBox() {
    const searchButton = qs('button[aria-label="Tìm kiếm"]');
    const input = document.getElementById("search-input");
    const close = document.getElementById("close-search");

    if (!searchButton || !input) return;

    searchButton.addEventListener("click", () => {
      input.classList.remove("hidden");
      if (close) close.classList.remove("hidden");
      input.focus();
    });

    if (close) {
      close.addEventListener("click", () => {
        input.classList.add("hidden");
        close.classList.add("hidden");
        input.value = "";
      });
    }

    input.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      const keyword = input.value.trim();
      if (!keyword) return;
      window.location.href = "https://bieudovang.com/tim-kiem/" + encodeURIComponent(keyword) + "/";
    });
  }

  function initTableFilter() {
    const select = document.getElementById("typeSelect");
    const rows = qsa("#goldTable tbody tr");
    const rowCount = document.getElementById("rowCount");

    const apply = () => {
      const value = select ? select.value : "all";
      let count = 0;

      rows.forEach((row) => {
        const match = value === "all" || row.dataset.type === value;
        row.classList.toggle("is-filtered-out", !match);
        if (match) count += 1;
      });

      if (rowCount) rowCount.textContent = `${count} kết quả`;
    };

    if (select) {
      select.addEventListener("change", apply);
      apply();
    }
  }

  function initReadMore() {
    const button = document.getElementById("loadMoreContent");
    const content = qs(".content-seo");
    if (!button || !content) return;

    button.addEventListener("click", () => {
      const expanded = content.classList.toggle("is-expanded");
      button.classList.toggle("is-expanded", expanded);
      const label = button.querySelector("span");
      if (label) label.textContent = expanded ? "Thu gọn" : "Xem thêm";
    });
  }

  function getRowPrices(row) {
    const cells = qsa("td", row);
    return {
      brand: (row.dataset.brand || "SJC").toUpperCase(),
      type: row.dataset.type || "",
      name: (cells[1] ? cells[1].innerText : "Giá vàng").trim(),
      buy: (cells[2] ? cells[2].innerText : "---").trim(),
      sell: (cells[3] ? cells[3].innerText : "---").trim(),
      change: (cells[4] ? cells[4].innerText : "---").replace(/\s+/g, " ").trim()
    };
  }

  function drawModalChart(range = "7d") {
    const container = document.getElementById("modalPriceChart");
    const points = getGoldData(range);

    if (modalChart && typeof modalChart.remove === "function") modalChart.remove();
    modalChart = drawLightweightChart(container, points, { height: 260 });
  }

  function initModalChart() {
    const wrapper = document.getElementById("modalChartWrapper");
    const close = document.getElementById("modalCloseBtn");
    const range = document.getElementById("modalTimeRangeSelect");

    qsa(".chart-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const row = button.closest("tr");
        const data = row ? getRowPrices(row) : {
          brand: button.dataset.brand || "SJC",
          name: button.dataset.type || "Giá vàng",
          buy: "---",
          sell: "---",
          change: "---"
        };

        const title = document.getElementById("modalTitle");
        const subtitle = document.getElementById("modalSubtitle");
        const buy = document.getElementById("modalBuyPrice");
        const sell = document.getElementById("modalSellPrice");
        const change = document.getElementById("modalChangePct");

        if (title) title.textContent = data.name;
        if (subtitle) subtitle.textContent = data.brand;
        if (buy) buy.textContent = data.buy;
        if (sell) sell.textContent = data.sell;
        if (change) change.textContent = data.change;

        if (wrapper) {
          wrapper.classList.add("is-open");
          wrapper.classList.remove("hidden");
        }

        setTimeout(() => drawModalChart(range ? range.value : "7d"), 60);
      });
    });

    const closeModal = () => {
      if (!wrapper) return;
      wrapper.classList.remove("is-open");
      wrapper.classList.add("hidden");
    };

    if (close) close.addEventListener("click", closeModal);
    if (wrapper) {
      wrapper.addEventListener("click", (event) => {
        if (event.target === wrapper) closeModal();
      });
    }

    if (range) {
      range.addEventListener("change", () => drawModalChart(range.value));
    }
  }

  function initLazyImages() {
    qsa("img[data-src]").forEach((img) => {
      if (!img.getAttribute("src")) {
        img.setAttribute("src", img.getAttribute("data-src"));
      }
    });
  }

  function initIcons() {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  function boot() {
    initLazyImages();
    initMobileMenu();
    initSearchBox();
    initTableFilter();
    initReadMore();
    initTimeRangeButtons();
    initModalChart();
    initIcons();

    const waitForChart = (attempt = 0) => {
      if (window.LightweightCharts || attempt > 25) {
        drawMainChart();
        return;
      }
      setTimeout(() => waitForChart(attempt + 1), 120);
    };

    waitForChart();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
