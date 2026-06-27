/* GitHub Pages compatibility fixes for exported Biểu Đồ Vàng page */
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function show(el) {
    if (el) el.classList.remove('hidden');
  }

  function hide(el) {
    if (el) el.classList.add('hidden');
  }

  ready(function () {
    var menuButton = document.getElementById('menu-button');
    var mobileMenu = document.getElementById('mobileMenu');
    var mobileMenuClose = document.getElementById('mobileMenuClose');
    var backdrop = document.getElementById('backdrop');

    function openMenu() {
      if (!mobileMenu) return;
      mobileMenu.classList.add('is-open');
      show(backdrop);
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      if (!mobileMenu) return;
      mobileMenu.classList.remove('is-open');
      hide(backdrop);
      document.body.style.overflow = '';
    }

    if (menuButton) menuButton.addEventListener('click', openMenu);
    if (mobileMenuClose) mobileMenuClose.addEventListener('click', closeMenu);
    if (backdrop) backdrop.addEventListener('click', closeMenu);

    document.querySelectorAll('[data-submenu-toggle]').forEach(function (button) {
      button.addEventListener('click', function (event) {
        var targetId = button.getAttribute('data-submenu-toggle');
        var target = document.getElementById(targetId);
        var icon = button.querySelector('svg');
        if (!target) return;

        if (event.target && event.target.tagName && event.target.tagName.toLowerCase() === 'a') {
          return;
        }

        event.preventDefault();
        target.classList.toggle('hidden');
        if (icon) icon.classList.toggle('rotate-180');
      });
    });

    var searchButton = document.querySelector('button[aria-label="Tìm kiếm"]');
    var searchInput = document.getElementById('search-input');
    var closeSearch = document.getElementById('close-search');

    if (searchButton && searchInput) {
      searchButton.addEventListener('click', function (event) {
        event.preventDefault();
        searchInput.classList.remove('hidden');
        if (closeSearch) closeSearch.classList.remove('hidden');
        searchInput.focus();
      });
    }

    if (closeSearch && searchInput) {
      closeSearch.addEventListener('click', function () {
        searchInput.value = '';
        searchInput.classList.add('hidden');
        closeSearch.classList.add('hidden');
      });
    }

    if (searchInput) {
      searchInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          var keyword = searchInput.value.trim();
          if (keyword) {
            window.location.href = 'https://bieudovang.com/tim-kiem/' + encodeURIComponent(keyword) + '/';
          }
        }
        if (event.key === 'Escape') {
          searchInput.classList.add('hidden');
          if (closeSearch) closeSearch.classList.add('hidden');
        }
      });
    }

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  });
})();
