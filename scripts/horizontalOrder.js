// Reorder items so CSS columns render them row-first (horizontal priority)
// Mobile: 1 column (no reorder), Tablet: 2 columns, Desktop: 3 columns
(function(){
  let lastWidth = window.innerWidth;
  
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
    if (cols <= 1) return; // No reordering needed for single column (mobile)

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
  function handleResize() {
    clearTimeout(resizeTimer);
    // Only reorder when actual breakpoint width changes (not on Safari scroll)
    resizeTimer = setTimeout(() => {
      const currentWidth = window.innerWidth;
      // Check if width change is significant (crossed breakpoint)
      const oldBreakpoint = lastWidth <= 480 ? 1 : (lastWidth <= 768 ? 2 : 3);
      const newBreakpoint = currentWidth <= 480 ? 1 : (currentWidth <= 768 ? 2 : 3);
      
      if (oldBreakpoint !== newBreakpoint) {
        lastWidth = currentWidth;
        reorderHorizontalPriority();
      }
    }, 150);
  }

  function init() {
    reorderHorizontalPriority();
    window.addEventListener('resize', handleResize);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
