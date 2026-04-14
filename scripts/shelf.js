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

function renderCover(book) {
  const ratio = book.width && book.height ? book.height / book.width : 1.45;
  const badge =
    book.status === 'reading'
      ? '<span class="shelf-book-badge" aria-label="Reading">reading</span>'
      : '';

  return `
    <div class="shelf-book-cover-wrap" style="--shelf-book-aspect: ${ratio};">
      ${badge}
      <img class="shelf-book-cover" src="${escapeHtml(book.cover)}" alt="" loading="lazy" width="${book.width || ''}" height="${book.height || ''}">
    </div>
  `;
}

function renderTitle(book) {
  return `<div class="shelf-book-title">${escapeHtml(book.title)}</div>`;
}

function renderRow(row) {
  const n = row.books.length;
  /* Grid row-major: all covers in row 1, all titles in row 2 */
  const booksHtml = row.books.map(renderCover).join('') + row.books.map(renderTitle).join('');
  return `
    <section class="shelf-row" data-row-id="${escapeHtml(row.id)}" style="--shelf-cols: ${n};">
      <div class="shelf-row-books" aria-label="Bookshelf row">
        ${booksHtml}
      </div>
      <div class="shelf-row-deco" aria-hidden="true">
        <!-- Replace inner SVG in shelf.html or here when your asset is ready -->
        <svg class="shelf-row-deco-svg" viewBox="0 0 1200 48" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path fill="rgba(47, 37, 22, 0.08)" stroke="currentColor" stroke-width="1.2" opacity="0.45"
            d="M0 8 L40 4 L1160 4 L1200 8 L1200 40 L1160 44 L40 44 L0 40 Z"/>
          <line x1="0" y1="12" x2="1200" y2="12" stroke="currentColor" stroke-width="0.8" opacity="0.25"/>
        </svg>
      </div>
    </section>
  `;
}

async function init() {
  if (!shelfRowsEl) return;

  try {
    const res = await fetch('shelf/index.json');
    const data = await res.json();

    if (shelfReadingEl) shelfReadingEl.textContent = String(data.stats?.reading ?? '—');
    if (shelfReadEl) shelfReadEl.textContent = String(data.stats?.read ?? '—');

    const rows = data.rows || [];
    shelfRowsEl.innerHTML = rows.map(renderRow).join('');
  } catch (e) {
    console.error('Failed to load shelf/index.json:', e);
    shelfRowsEl.innerHTML =
      '<p class="shelf-error">Could not load shelf data.</p>';
  }
}

document.addEventListener('DOMContentLoaded', init);
