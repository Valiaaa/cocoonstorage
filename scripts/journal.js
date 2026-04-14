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
    if (JOURNALS.length > 0) selectJournal(JOURNALS[0]);
  } catch (e) {
    console.error('Failed to load journal/index.json:', e);
  }
}

// ── Fetch a single entry JSON file ────────────────────────────
async function fetchEntry(notebookId, entryId) {
  const res = await fetch(`journal/${notebookId}/${entryId}.json`);
  if (!res.ok) throw new Error(`Entry not found: ${notebookId}/${entryId}.json`);
  return res.json();
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
async function selectJournal(journal) {
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
    renderToc(journal, entryMetas);

    // Show first entry by default
    if (entryMetas.length > 0) {
      renderSingleEntry(entryMetas[0]);
      activeEntry = entryMetas[0];
      markTocActive(entryMetas[0].id);
    }
  } else {
    journalViewer.classList.add('double-sided');
    hideToc();
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
      <span class="toc-entry-date">${entry.date}</span>
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
      <div class="notebook-entry-date">${entry.date}</div>
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
document.addEventListener('DOMContentLoaded', init);
