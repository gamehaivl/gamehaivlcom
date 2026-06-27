(() => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#primary-menu');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const input = document.querySelector('#site-search-input');
  const cards = [...document.querySelectorAll('.app-card')];
  const grids = [...document.querySelectorAll('.card-grid')];

  function ensureNoResult(grid) {
    let box = grid.querySelector('.no-results');
    if (!box) {
      box = document.createElement('div');
      box.className = 'no-results is-hidden';
      box.textContent = 'Không tìm thấy nội dung phù hợp.';
      grid.appendChild(box);
    }
    return box;
  }
  grids.forEach(ensureNoResult);

  if (input && cards.length) {
    input.addEventListener('input', () => {
      const keyword = input.value.trim().toLowerCase();
      cards.forEach(card => {
        const haystack = `${card.dataset.title || ''} ${card.dataset.category || ''}`;
        card.classList.toggle('is-hidden', Boolean(keyword) && !haystack.includes(keyword));
      });
      grids.forEach(grid => {
        const visible = [...grid.querySelectorAll('.app-card')].some(card => !card.classList.contains('is-hidden'));
        ensureNoResult(grid).classList.toggle('is-hidden', visible);
      });
    });
  }
})();
