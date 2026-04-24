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
   Book Card — floating draggable notes, multiple coexist
   ==================================================== */

let bookMap = {};
let cardZCounter = 9000;
let openCards = {}; // Track open bookId -> card element

// Slight random tilt on landing: alternates left/right each card
let cardTiltSeed = 0;

function bringCardToFront(card) {
  card.style.zIndex = ++cardZCounter;
}

function openBookCard(bookId) {
  // If card is already open, just bring to front
  if (openCards[bookId]) {
    const existing = openCards[bookId];
    bringCardToFront(existing);
    // Optional: could add a tiny "ping" animation here if needed
    return;
  }

  const book = bookMap[bookId];
  if (!book) return;

  // Reverse numbering: last book on shelf is No.1
  const bookIndex = allBooks.findIndex(b => b.id === bookId);
  const reversedNum = (allBooks.length - bookIndex).toString().padStart(3, '0');
  const numDisplay = `NO.${reversedNum}`;

  const rows = [
    { label: 'TITLE', value: book.title || '' },
    { label: 'AUTHOR', value: book.author || '' },
    { label: 'GENRE', value: book.genre || '' },
    { label: 'READING MOTIVE', value: book.motif || '' },
  ];

  const tableRows = rows.map(r => `
    <tr class="sc-row">
      <td class="sc-label">${r.label}</td>
      <td class="sc-value">${escapeHtml(r.value)}</td>
    </tr>
  `).join('');

  const commentText = book.comment && book.comment.trim()
    ? escapeHtml(book.comment)
    : '<em style="opacity: 0.5;">Still working on the comments...</em>';

  // Determine landing tilt (alternating slight left/right)
  cardTiltSeed++;
  const tiltDeg = cardTiltSeed % 2 === 0 ? -1.8 : 1.8;

  // Horizontal scatter: center ± small offset so cards don't perfectly stack
  const scatterX = (Math.random() - 0.5) * 80; // –40px … +40px

  const card = document.createElement('div');
  card.className = 'sc-card';
  card.setAttribute('role', 'dialog');
  card.dataset.bookId = bookId;
  card.style.zIndex = ++cardZCounter;
  card.style.setProperty('--sc-tilt', `${tiltDeg}deg`);
  card.style.setProperty('--sc-scatter', `${scatterX}px`);

  card.innerHTML = `
    <div class="sc-header">
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
  `;

  document.body.appendChild(card);
  openCards[bookId] = card;

  // ---- Draggable: whole card is the drag surface ----
  let isDragging = false;
  let startX, startY, startLeft, startTop;
  let hasMoved = false;

  function bringToFront() {
    bringCardToFront(card);
  }

  function onPointerDown(e) {
    if (e.target.closest('.sc-close')) return;

    // Stop bubbling so parent containers (like shelfRows) don't get the click
    e.stopPropagation();

    e.preventDefault(); // prevent text selection
    bringToFront();
    isDragging = true;
    hasMoved = false;
    card.classList.add('is-dragging');

    // Capture current rendered position
    const rect = card.getBoundingClientRect();
    startLeft = rect.left;
    startTop = rect.top;
    startX = e.clientX;
    startY = e.clientY;

    // Switch from CSS transform centering to fixed pixel coords
    card.style.left = startLeft + 'px';
    card.style.top = startTop + 'px';
    card.classList.add('sc-positioned');

    // Add window listeners only while dragging
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved = true;
    card.style.left = (startLeft + dx) + 'px';
    card.style.top = (startTop + dy) + 'px';
  }

  function onPointerUp() {
    if (!isDragging) return;
    isDragging = false;
    card.classList.remove('is-dragging');

    // Remove listeners when drag ends
    window.removeEventListener('mousemove', onPointerMove);
    window.removeEventListener('mouseup', onPointerUp);
  }

  card.addEventListener('mousedown', onPointerDown);

  // Prevent clicks from bubbling up to document
  card.addEventListener('click', e => {
    e.stopPropagation();
  });

  // Touch support
  card.addEventListener('touchstart', e => {
    if (e.target.closest('.sc-close')) return;
    e.stopPropagation();
    const t = e.touches[0];

    // Mocking onPointerDown for touch
    isDragging = true;
    hasMoved = false;
    bringToFront();
    card.classList.add('is-dragging');
    const rect = card.getBoundingClientRect();
    startLeft = rect.left;
    startTop = rect.top;
    startX = t.clientX;
    startY = t.clientY;
    card.style.left = startLeft + 'px';
    card.style.top = startTop + 'px';
    card.classList.add('sc-positioned');

    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
  }, { passive: false });

  function onTouchMove(e) {
    if (!isDragging) return;
    e.preventDefault(); // Stop scrolling while dragging card
    const t = e.touches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    card.style.left = (startLeft + dx) + 'px';
    card.style.top = (startTop + dy) + 'px';
  }

  function onTouchEnd() {
    isDragging = false;
    card.classList.remove('is-dragging');
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend', onTouchEnd);
  }

  // Close button
  card.querySelector('.sc-close').addEventListener('click', (e) => {
    e.stopPropagation();
    closeCard(card);
  });

  // Slide-in animation: trigger on next frame
  requestAnimationFrame(() => requestAnimationFrame(() => card.classList.add('sc-visible')));
}

function closeCard(card) {
  const bId = card.dataset.bookId;
  if (bId && openCards[bId]) {
    delete openCards[bId];
  }

  card.classList.remove('sc-visible');
  card.classList.add('sc-closing');
  card.addEventListener('transitionend', () => card.remove(), { once: true });
}

// Close topmost card on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    // Find the card with the highest z-index
    const cards = [...document.querySelectorAll('.sc-card')];
    if (!cards.length) return;
    const top = cards.reduce((a, b) =>
      parseInt(a.style.zIndex) >= parseInt(b.style.zIndex) ? a : b
    );
    closeCard(top);
  }
});

/* ====================================================
   Recommendation Form Card
   ==================================================== */
function openRecommendCard() {
  if (openCards['recommend_form']) {
    bringCardToFront(openCards['recommend_form']);
    return;
  }

  cardTiltSeed++;
  const tiltDeg = cardTiltSeed % 2 === 0 ? -1.8 : 1.8;
  const scatterX = (Math.random() - 0.5) * 80;

  const card = document.createElement('div');
  card.className = 'sc-card';
  card.setAttribute('role', 'dialog');
  card.dataset.bookId = 'recommend_form';
  card.style.zIndex = ++cardZCounter;
  card.style.setProperty('--sc-tilt', `${tiltDeg}deg`);
  card.style.setProperty('--sc-scatter', `${scatterX}px`);

  card.innerHTML = `
    <div class="sc-header">
      <span class="sc-num" style="opacity: 1; font-weight: 500;">Recommend me a book</span>
      <button class="sc-close" aria-label="Close">✕</button>
    </div>
    <div class="sc-rule sc-rule--top"></div>
    <form id="recommend-form" class="sc-form" style="flex: 1; width: 96%; margin: 0 auto;">
      <input type="text" name="name" class="sc-input" placeholder="Your Name" required>
      <input type="email" name="email" class="sc-input" placeholder="Your Email" required>
      <input type="text" name="book_title" class="sc-input" placeholder="Book Title" required>
      <input type="text" name="author" class="sc-input" placeholder="Author (optional)">
      
      <div class="sc-comments-wrap" style="margin-top: 12px; margin-bottom: 4px; min-height: 120px;">
        <div class="sc-comments-label">Reading recommendation</div>
        <textarea name="message" class="sc-input sc-input--noborder" placeholder="I like this book because..." required style="flex: 1; height: 100%; width: 100%;"></textarea>
      </div>
        
      <div style="display: flex; justify-content: flex-end; width: 100%; margin-bottom: 20px;">
        <button type="submit" class="sc-btn">Send Recommendation</button>
      </div>
    </form>
    <div class="sc-rule sc-rule--bottom"></div>
  `;

  document.body.appendChild(card);
  openCards['recommend_form'] = card;

  // --- Drag Logic ---
  let isDragging = false;
  let startX, startY, startLeft, startTop;
  let hasMoved = false;

  function onPointerDown(e) {
    if (e.target.closest('.sc-close') || e.target.closest('.sc-input') || e.target.closest('.sc-btn')) return;

    e.stopPropagation();
    e.preventDefault();
    bringCardToFront(card);
    isDragging = true;
    hasMoved = false;
    card.classList.add('is-dragging');

    const rect = card.getBoundingClientRect();
    startLeft = rect.left;
    startTop = rect.top;
    startX = e.clientX;
    startY = e.clientY;

    card.style.left = startLeft + 'px';
    card.style.top = startTop + 'px';
    card.classList.add('sc-positioned');

    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved = true;
    card.style.left = (startLeft + dx) + 'px';
    card.style.top = (startTop + dy) + 'px';
  }

  function onPointerUp() {
    if (!isDragging) return;
    isDragging = false;
    card.classList.remove('is-dragging');
    window.removeEventListener('mousemove', onPointerMove);
    window.removeEventListener('mouseup', onPointerUp);
  }

  card.addEventListener('mousedown', onPointerDown);
  card.addEventListener('click', e => e.stopPropagation());

  // Close button
  card.querySelector('.sc-close').addEventListener('click', (e) => {
    e.stopPropagation();
    closeCard(card);
  });

  // Slide-in animation
  requestAnimationFrame(() => requestAnimationFrame(() => card.classList.add('sc-visible')));

  // Form Submission
  const form = card.querySelector('#recommend-form');
  const btn = card.querySelector('.sc-btn');

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    btn.textContent = 'Sending...';
    btn.disabled = true;

    emailjs.sendForm('service_eq5vyqa', 'template_ldmee2j', this)
      .then(() => {
        btn.textContent = 'Your recommendation is well received. Thank you.';
        setTimeout(() => closeCard(card), 2500);
      }, (error) => {
        console.error('FAILED...', error);
        btn.textContent = 'Failed. Try again.';
        btn.disabled = false;
      });
  });
}

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

    // Recommend Form Trigger
    const statsContainer = document.querySelector('.shelf-stats');
    if (statsContainer) {
      statsContainer.addEventListener('click', () => {
        openRecommendCard();
      });
    }

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
