// Reorder items so CSS columns render them row-first (horizontal priority)
(function(){
  function getColumnCount(container) {
    if (!container) return 1;
    const cs = getComputedStyle(container);
    const colCount = parseInt(cs.columnCount, 10);
    if (colCount && colCount > 0 && !Number.isNaN(colCount)) return colCount;
    // fallback to breakpoints similar to CSS
    if (window.innerWidth <= 480) return 1;
    if (window.innerWidth <= 768) return 2;
    return 3;
  }

  function reorderHorizontalPriority() {
    const container = document.querySelector('.content');
    if (!container) return;

    const items = Array.from(container.children);
    if (items.length === 0) return;

    const cols = getColumnCount(container);
    if (cols <= 1) return;

    // distribute items into columns in row-major order: item i goes to column (i % cols)
    const columns = Array.from({length: cols}, () => []);
    items.forEach((it, i) => {
      const c = i % cols;
      columns[c].push(it);
    });

    // re-append column by column so the DOM order is column-major (what CSS columns expect)
    const frag = document.createDocumentFragment();
    columns.forEach(colItems => colItems.forEach(it => frag.appendChild(it)));

    // append frag (moves nodes)
    container.appendChild(frag);
  }

  let resizeTimer = null;
  function init() {
    reorderHorizontalPriority();
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(reorderHorizontalPriority, 150);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
