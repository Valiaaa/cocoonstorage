/* ============================================================
   journal.js — Journal page interaction logic
   Loads data from journal/index.json and per-entry JSON files.
   ============================================================ */

// ── State ─────────────────────────────────────────────────────
let JOURNALS = [];
let activeJournal = null;
let activeEntry = null;

// ── DOM refs ──────────────────────────────────────────────────
const notebookList = document.getElementById('notebookList');
const journalToc = document.getElementById('journalToc');
const journalViewer = document.getElementById('journalViewer');
const notebookPage = document.getElementById('notebookPage');

// ── Init: load index.json ─────────────────────────────────────
async function init() {
  try {
    const res = await fetch('journal/index.json');
    const data = await res.json();
    JOURNALS = data.notebooks;
    renderSidebar();

    const urlParams = new URLSearchParams(window.location.search);
    const notebookParam = urlParams.get('notebook');
    const entryParam = urlParams.get('entry');

    let initialJournal = JOURNALS.length > 0 ? JOURNALS[0] : null;

    if (notebookParam) {
      const foundJournal = JOURNALS.find(j => j.id === notebookParam);
      if (foundJournal) {
        initialJournal = foundJournal;
      }
    }

    if (initialJournal) {
      await selectJournal(initialJournal, entryParam);
    }
  } catch (e) {
    console.error('Failed to load journal/index.json:', e);
  }
}

// ── URL Sync Helper ───────────────────────────────────────────
function updateJournalURL(notebookId, entryId) {
  const url = new URL(window.location);
  if (notebookId) {
    url.searchParams.set('notebook', notebookId);
  } else {
    url.searchParams.delete('notebook');
  }
  if (entryId) {
    url.searchParams.set('entry', entryId);
  } else {
    url.searchParams.delete('entry');
  }
  window.history.replaceState({}, '', url);
}

// ── Fetch a single entry (JSON or Markdown) ───────────────────
async function fetchEntry(notebookId, entryId) {
  // 1. Try JSON first
  try {
    const res = await fetch(`journal/${notebookId}/${entryId}.json`);
    if (res.ok) return await res.json();
  } catch (e) {
    // Ignore error, try MD next
  }

  // 2. Try Markdown
  const res = await fetch(`journal/${notebookId}/${entryId}.md`);
  if (res.ok) {
    const text = await res.text();
    return parseMarkdownEntry(text, entryId);
  }

  throw new Error(`Entry not found: journal/${notebookId}/${entryId}`);
}

/**
 * Basic YAML Frontmatter + Markdown parser
 */
function parseMarkdownEntry(text, id) {
  const frontmatterRegex = /^---\s*([\s\S]*?)\s*---\s*([\s\S]*)$/;
  const match = text.match(frontmatterRegex);

  let entry = { id, title: id, date: '', content: text };

  if (match) {
    const yaml = match[1];
    const body = match[2];

    // Simple line-by-line YAML parser (split by first colon)
    yaml.split('\n').forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > -1) {
        const key = line.slice(0, colonIndex).trim();
        const val = line.slice(colonIndex + 1).trim();
        if (key) entry[key] = val;
      }
    });

    entry.content = marked.parse(body);
  } else {
    entry.content = marked.parse(text);
  }

  return entry;
}

/**
 * Formats a YYYY-MM-DD string into MM/DD/YYYY for display.
 * If the input is already slash-separated or invalid, returns as-is.
 */
function formatDateForDisplay(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return dateStr;
  if (dateStr.includes('/')) return dateStr; // already formatted or old format

  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    return `${m}/${d}/${y}`;
  }
  return dateStr;
}


// ── Sidebar rendering ─────────────────────────────────────────
function renderSidebar() {
  notebookList.innerHTML = '';
  JOURNALS.forEach(journal => {
    const item = document.createElement('div');
    item.className = 'notebook-item hoverZoom';
    item.dataset.id = journal.id;
    item.innerHTML = `
      <div class="notebook-thumb">
        <div class="notebook-thumb-inner" style="background:${journal.color};"></div>
      </div>
      <span class="notebook-label">${journal.name}</span>
    `;
    item.addEventListener('click', () => selectJournal(journal));
    notebookList.appendChild(item);
  });
}

// ── Select a journal ──────────────────────────────────────────
async function selectJournal(journal, initialEntryId = null) {
  activeJournal = journal;
  activeEntry = null;

  // Mark active in sidebar
  document.querySelectorAll('.notebook-item').forEach(el => {
    el.classList.toggle('active', el.dataset.id === journal.id);
  });

  if (journal.type === 'single') {
    journalViewer.classList.remove('double-sided');

    // Load all entry metadata for TOC (fetch each entry's title + date)
    const entryMetas = await Promise.all(
      journal.entries.map(id => fetchEntry(journal.id, id))
    );

    // Sort entries by date (newest first)
    entryMetas.sort((a, b) => {
      const d1 = new Date(a.date);
      const d2 = new Date(b.date);
      return d2 - d1;
    });

    renderToc(journal, entryMetas);

    let targetEntry = null;
    if (initialEntryId) {
      targetEntry = entryMetas.find(e => e.id === initialEntryId);
    }
    if (!targetEntry && entryMetas.length > 0) {
      targetEntry = entryMetas[0];
    }

    // Show target entry
    if (targetEntry) {
      renderSingleEntry(targetEntry);
      activeEntry = targetEntry;
      markTocActive(targetEntry.id);
      updateJournalURL(journal.id, targetEntry.id);
    } else {
      updateJournalURL(journal.id, null);
    }
  } else {
    journalViewer.classList.add('double-sided');
    hideToc();
    updateJournalURL(journal.id, null);
    // Load double-sided content
    const content = await fetchEntry(journal.id, journal.entries[0]);
    renderDoubleViewer(content);
  }
}

// ── TOC ───────────────────────────────────────────────────────
function renderToc(journal, entries) {
  // Keep ghost spacer (first child), clear only entries after it
  const spacer = journalToc.querySelector('.journal-col-spacer');
  journalToc.classList.remove('hidden');
  journalToc.innerHTML = '';
  if (spacer) journalToc.appendChild(spacer);

  entries.forEach((entry, i) => {
    const el = document.createElement('div');
    el.className = 'journal-toc-entry hoverZoom' + (i === 0 ? ' active' : '');
    el.dataset.entryId = entry.id;
    el.innerHTML = `
      <span class="toc-entry-title">
        <span class="toc-entry-title-text">${entry.title}</span>
        <span class="toc-entry-arrow" aria-hidden="true">&#8599;</span>
      </span>
      <span class="toc-entry-date">${formatDateForDisplay(entry.date)}</span>
    `;
    el.addEventListener('click', () => onTocEntryClick(journal, entry.id));
    journalToc.appendChild(el);
  });
}

function hideToc() {
  const spacer = journalToc.querySelector('.journal-col-spacer');
  journalToc.classList.add('hidden');
  journalToc.innerHTML = '';
  if (spacer) journalToc.appendChild(spacer);
}

function markTocActive(entryId) {
  document.querySelectorAll('.journal-toc-entry').forEach(el => {
    el.classList.toggle('active', el.dataset.entryId === entryId);
  });
}

// ── Click a TOC entry ─────────────────────────────────────────
async function onTocEntryClick(journal, entryId) {
  if (activeEntry && activeEntry.id === entryId) return; // already showing

  try {
    const entry = await fetchEntry(journal.id, entryId);
    activeEntry = entry;
    markTocActive(entryId);
    updateJournalURL(journal.id, entryId);

    // Fade out → swap content → fade in
    notebookPage.classList.add('fading');
    setTimeout(() => {
      renderSingleEntry(entry);
      notebookPage.classList.remove('fading');
    }, 200);
  } catch (e) {
    console.error('Failed to load entry:', e);
  }
}

// ── Viewer: single entry only ─────────────────────────────────
function renderSingleEntry(entry) {
  notebookPage.innerHTML = `
    <div class="notebook-entry" id="entry-${entry.id}">
      <div class="notebook-entry-title">
        <span class="notebook-entry-title-text">${entry.title}</span>
      </div>
      <div class="notebook-entry-date">Last updated on ${formatDateForDisplay(entry.date)}</div>
      <div class="notebook-entry-body">${entry.content}</div>
    </div>
  `;
  // Scroll back to top on each new entry
  notebookPage.scrollTop = 0;
}

// ── Viewer: double-sided spread ───────────────────────────────
function renderDoubleViewer(content) {
  notebookPage.innerHTML = `
    <div class="notebook-spread">
      <div class="notebook-spread-left">${content.leftContent}</div>
      <div class="notebook-spread-right">${content.rightContent}</div>
    </div>
  `;
}

// ── Kick off ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  init();

  // Intercept internal entry links
  notebookPage.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link) {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#entry:')) {
        e.preventDefault();
        const entryId = href.split(':')[1];
        if (activeJournal) {
          onTocEntryClick(activeJournal, entryId);
        }
      }
    }
  });

  // Handle auto-select for prompt inputs
  document.addEventListener('focusin', (e) => {
    if (e.target.classList.contains('prompt-input')) {
      // Small delay to ensure the browser's default cursor placement doesn't override us
      setTimeout(() => {
        const range = document.createRange();
        range.selectNodeContents(e.target);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }, 0);
    }
  });
});


/**
 * Copies the text from a .prompt-block to the clipboard.
 * Provides visual feedback on the button.
 */
function copyPrompt(btn) {
  const block = btn.closest('.prompt-block');
  const textContainer = block.querySelector('.prompt-text');
  const text = textContainer.innerText;

  navigator.clipboard.writeText(text).then(() => {
    btn.classList.add('copied');
    const originalHTML = btn.innerHTML;
    
    // Switch to checkmark icon
    btn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L100,192.69,218.34,74.34a8,8,0,0,1,11.32,11.32Z"></path></svg>
    `;

    setTimeout(() => {
      btn.classList.remove('copied');
      btn.innerHTML = originalHTML;
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy: ', err);
  });
}

