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

/* ====================================================
   Book Card Modal
   ==================================================== */

let bookMap = {};

function openBookCard(bookId) {
  const book = bookMap[bookId];
  if (!book) return;

  const existing = document.getElementById('shelf-card-overlay');
  if (existing) existing.remove();

  // Reverse numbering: last book on shelf is No.1
  const bookIndex = allBooks.findIndex(b => b.id === bookId);
  const reversedNum = (allBooks.length - bookIndex).toString().padStart(3, '0');
  const numDisplay = `NO.${reversedNum}`;

  const rows = [
    { label: 'TITLE',          value: book.title   || '' },
    { label: 'AUTHOR',         value: book.author  || '' },
    { label: 'GENRE',          value: book.genre   || '' },
    { label: 'READING MOTIVE', value: book.motif   || '' },
  ];

  const tableRows = rows.map(r => `
    <tr class="sc-row">
      <td class="sc-label">${r.label}</td>
      <td class="sc-value">${escapeHtml(r.value)}</td>
    </tr>
  `).join('');

  const commentText = book.comment && book.comment.trim() ? escapeHtml(book.comment) : '<em style="opacity: 0.5;">Still working on the comments...</em>';

  const overlay = document.createElement('div');
  overlay.id = 'shelf-card-overlay';
  overlay.innerHTML = `
    <div class="sc-card" role="dialog" aria-modal="true">
      <div class="sc-header" id="sc-drag-handle">
        <span class="sc-num">${escapeHtml(numDisplay)}</span>
        <span class="sc-site">VALIA'S&nbsp;SHELF</span>
        <button class="sc-close" aria-label="Close">✕</button>
      </div>
      <div class="sc-rule sc-rule--double"></div>
      <table class="sc-table">
        <tbody>${tableRows}</tbody>
      </table>
      <div class="sc-rule sc-rule--double"></div>
      <div class="sc-comments-wrap">
        <div class="sc-comments-label">Comments</div>
        <div class="sc-comments-body">${commentText}</div>
      </div>
      <div class="sc-rule sc-rule--bottom"></div>
    </div>
  `;

  document.body.appendChild(overlay);

  const card = overlay.querySelector('.sc-card');
  const header = overlay.querySelector('.sc-header');

  // Draggable logic
  let isDragging = false;
  let offsetX, offsetY;

  header.addEventListener('mousedown', e => {
    if (e.target.closest('.sc-close')) return;
    
    isDragging = true;
    card.classList.add('is-dragging');
    
    // Calculate initial offset from click point to card top-left
    const rect = card.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    
    // Switch to absolute positioning instead of transform centering
    card.style.top = rect.top + 'px';
    card.style.left = rect.left + 'px';
    card.style.transform = 'none';
  });

  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    
    let left = e.clientX - offsetX;
    let top = e.clientY - offsetY;
    
    card.style.left = left + 'px';
    card.style.top = top + 'px';
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
    card.classList.remove('is-dragging');
  });

  // Close handlers
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeBookCard();
  });
  overlay.querySelector('.sc-close').addEventListener('click', closeBookCard);

  // Force transition
  requestAnimationFrame(() => overlay.classList.add('sc-visible'));
}

function closeBookCard() {
  const overlay = document.getElementById('shelf-card-overlay');
  if (!overlay) return;
  overlay.classList.remove('sc-visible');
  overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
  document.body.classList.remove('shelf-card-open');
}

// Close on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeBookCard();
});

/* ====================================================
   Book rendering
   ==================================================== */

function renderBook(book) {
  const badge =
    book.status === 'reading'
      ? '<span class="shelf-book-badge" aria-label="Reading">reading</span>'
      : '';

  const w = book.width || 200;
  const h = book.height || 300;

  return `
    <div class="shelf-book-item" data-book-id="${escapeHtml(book.id)}">
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

    const rows = data.rows || [];
    allBooks = rows.flatMap(r => r.books);

    // Filter out hidden books
    allBooks = allBooks.filter(b => !b.hidden);

    // Calculate stats dynamically from data
    const readingCount = allBooks.filter(b => b.status === 'reading').length;
    const readCount = allBooks.filter(b => b.status === 'read').length;

    if (shelfReadingEl) shelfReadingEl.textContent = String(readingCount);
    if (shelfReadEl) shelfReadEl.textContent = String(readCount);

    // Build lookup map for card data
    allBooks.forEach(b => { bookMap[b.id] = b; });

    renderBooksDynamically();

    // Click delegation: opens card when a book is clicked
    shelfRowsEl.addEventListener('click', e => {
      const item = e.target.closest('.shelf-book-item');
      if (item) openBookCard(item.dataset.bookId);
    });

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
