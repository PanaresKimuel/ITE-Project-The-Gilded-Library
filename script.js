document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const themeButton = document.querySelector('[data-theme-toggle]');
  const savedTheme = localStorage.getItem('darkAcademiaTheme');
  if (savedTheme === 'dark') body.classList.add('dark-mode');
  if (themeButton) {
    const updateThemeLabel = () => themeButton.textContent = body.classList.contains('dark-mode') ? '☀ Light mode' : '☾ Dark mode';
    updateThemeLabel();
    themeButton.addEventListener('click', () => {
      body.classList.toggle('dark-mode');
      localStorage.setItem('darkAcademiaTheme', body.classList.contains('dark-mode') ? 'dark' : 'light');
      updateThemeLabel();
    });
  }

  // Like buttons remember a visitor's favorites in this browser.
  document.querySelectorAll('[data-like]').forEach(button => {
    const id = button.dataset.like;
    const key = 'likedBooks';
    const likes = JSON.parse(localStorage.getItem(key) || '[]');
    if (likes.includes(id)) { button.classList.add('liked'); button.textContent = '♥'; button.setAttribute('aria-pressed','true'); }
    button.addEventListener('click', () => {
      let current = JSON.parse(localStorage.getItem(key) || '[]');
      if (current.includes(id)) current = current.filter(item => item !== id);
      else current.push(id);
      localStorage.setItem(key, JSON.stringify(current));
      const liked = current.includes(id);
      button.classList.toggle('liked', liked);
      button.textContent = liked ? '♥' : '♡';
      button.setAttribute('aria-pressed', String(liked));
      showToast(liked ? 'Added to your favorites.' : 'Removed from your favorites.');
    });
  });

  // Search and genre filtering on the library page.
  const search = document.querySelector('#bookSearch');
  const genre = document.querySelector('#genreFilter');
  const cards = [...document.querySelectorAll('[data-book-card]')];
  const empty = document.querySelector('#emptyState');
  function filterBooks() {
    const term = (search?.value || '').trim().toLowerCase();
    const selected = genre?.value || 'all';
    let visible = 0;
    cards.forEach(card => {
      const matchesText = card.textContent.toLowerCase().includes(term);
      const matchesGenre = selected === 'all' || card.dataset.genre === selected;
      const show = matchesText && matchesGenre;
      card.hidden = !show;
      if (show) visible++;
    });
    if (empty) empty.hidden = visible !== 0;
    const count = document.querySelector('#resultCount');
    if (count) count.textContent = `${visible} ${visible === 1 ? 'book' : 'books'} found`;
  }
  search?.addEventListener('input', filterBooks);
  genre?.addEventListener('change', filterBooks);

  // Show/hide synopsis on each story page.
  const synopsisToggle = document.querySelector('[data-synopsis-toggle]');
  const synopsisText = document.querySelector('[data-synopsis-text]');
  if (synopsisToggle && synopsisText) {
    synopsisToggle.addEventListener('click', () => {
      const hidden = synopsisText.hidden;
      synopsisText.hidden = !hidden;
      synopsisToggle.textContent = hidden ? 'Hide synopsis' : 'Show synopsis';
    });
  }

  // Reading progress bar.
  const progressFill = document.querySelector('[data-progress-fill]');
  const readingArea = document.querySelector('[data-reading-area]');
  if (progressFill && readingArea) {
    const updateProgress = () => {
      const rect = readingArea.getBoundingClientRect();
      const total = readingArea.offsetHeight - window.innerHeight;
      const read = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
      const pct = total <= 0 ? 100 : Math.round(read / total * 100);
      progressFill.style.width = `${pct}%`;
    };
    window.addEventListener('scroll', updateProgress, {passive:true});
    updateProgress();
  }

  // Back-to-top button and toast feedback.
  const backTop = document.querySelector('.back-top');
  if (backTop) {
    window.addEventListener('scroll', () => backTop.classList.toggle('visible', window.scrollY > 500), {passive:true});
    backTop.addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));
  }
});
function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role','status');
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(window.__toastTimer);
  window.__toastTimer = window.setTimeout(() => toast.classList.remove('show'), 1900);
}
