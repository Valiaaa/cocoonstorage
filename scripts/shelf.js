/* ============================================================
   shelf.js — Shelf page: loads shelf/index.json and renders rows
   ============================================================ */

const shelfRowsEl = document.getElementById('shelfRows');
const shelfReadingEl = document.getElementById('shelfStatReading');
const shelfReadEl = document.getElementById('shelfStatRead');

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

function renderBook(book) {
  const badge =
    book.status === 'reading'
      ? '<span class="shelf-book-badge" aria-label="Reading">reading</span>'
      : '';

  const w = book.width || 200;
  const h = book.height || 300;

  return `
    <div class="shelf-book-item">
      <div class="shelf-book-cover-wrap">
        ${badge}
        <img class="shelf-book-cover" src="${escapeHtml(book.cover)}" alt=""
             loading="lazy"
             style="--book-w: ${w}px; --book-h: ${h}px;">
      </div>
    </div>
  `;
}

function getThemeName() {
  return document.documentElement.getAttribute('data-theme') || 'white cube';
}

function updateShelfTextures() {
  const theme = getThemeName();
  const themeUri = encodeURIComponent(theme);
  document.querySelectorAll('.shelf-row-deco picture').forEach(pic => {
    const source = pic.querySelector('.shelf-texture-phone');
    const img = pic.querySelector('.shelf-texture-pc');
    if (source) source.srcset = `shelf/shelf/${themeUri}_phone.svg`;
    if (img) img.src = `shelf/shelf/${themeUri}_pc.svg`;
  });
}

let allBooks = [];

function getScale() {
  const rootScale = getComputedStyle(document.documentElement).getPropertyValue('--shelf-book-scale');
  const parsed = parseFloat(rootScale);
  return isNaN(parsed) ? 0.5 : parsed;
}

function generateRowHtml(rowBooks, themeUri) {
  const booksHtml = rowBooks.map(renderBook).join('');
  return `
    <section class="shelf-row">
      <div class="shelf-row-books" aria-label="Bookshelf row">
        ${booksHtml}
      </div>
      <div class="shelf-row-deco" aria-hidden="true">
        <picture>
          <source media="(max-width: 768px)" srcset="shelf/shelf/${themeUri}_phone.svg" class="shelf-texture-phone">
          <img class="shelf-row-deco-img shelf-texture-pc" src="shelf/shelf/${themeUri}_pc.svg" alt="" style="width: 100%; object-fit: fill; display: block;">
        </picture>
      </div>
    </section>
  `;
}

function renderBooksDynamically() {
  if (!allBooks || allBooks.length === 0 || !shelfRowsEl) return;
  
  const layoutEl = document.querySelector('.shelf-layout');
  const ww = window.innerWidth;
  const containerRatio = ww <= 768 ? 0.96 : 0.9;
  const containerWidth = layoutEl.clientWidth * containerRatio;
  
  const scale = getScale();
  const gap = 60;
  const theme = getThemeName();
  const themeUri = encodeURIComponent(theme);
  
  let rowsHtml = '';
  let currentRowBooks = [];
  let currentWidth = 0;
  
  for (let i = 0; i < allBooks.length; i++) {
      const book = allBooks[i];
      const bookW = (book.width || 200) * scale;
      const addWidth = currentRowBooks.length === 0 ? bookW : gap + bookW;
      
      if (currentWidth + addWidth > containerWidth - 5 && currentRowBooks.length > 0) {
          rowsHtml += generateRowHtml(currentRowBooks, themeUri);
          currentRowBooks = [book];
          currentWidth = bookW;
      } else {
          currentRowBooks.push(book);
          currentWidth += addWidth;
      }
  }
  if (currentRowBooks.length > 0) {
      rowsHtml += generateRowHtml(currentRowBooks, themeUri);
  }
  
  shelfRowsEl.innerHTML = rowsHtml;
}

async function init() {
  if (!shelfRowsEl) return;

  try {
    const res = await fetch('shelf/index.json');
    const data = await res.json();

    if (shelfReadingEl) shelfReadingEl.textContent = String(data.stats?.reading ?? '—');
    if (shelfReadEl) shelfReadEl.textContent = String(data.stats?.read ?? '—');

    const rows = data.rows || [];
    allBooks = rows.flatMap(r => r.books);

    renderBooksDynamically();

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(renderBooksDynamically, 150);
    });
    
    // Listen for theme changes to swap the shelf textures dynamically
    const observer = new MutationObserver(mlist => {
        for (let m of mlist) {
            if (m.type === 'attributes' && m.attributeName === 'data-theme') {
                updateShelfTextures();
            }
        }
    });
    observer.observe(document.documentElement, { attributes: true });

  } catch (e) {
    console.error('Failed to load shelf/index.json:', e);
    shelfRowsEl.innerHTML =
      '<p class="shelf-error">Could not load shelf data.</p>';
  }
}

document.addEventListener('DOMContentLoaded', init);
