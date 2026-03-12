// Masonry layout: place images into the shortest column, left-to-right on ties.
// Desktop (>768px): 3 columns, Mobile (<=768px): 2 columns
(function () {
  let lastBreakpoint = 0;

  function getColumnCount() {
    return window.innerWidth <= 768 ? 2 : 3;
  }

  function buildMasonry() {
    var containers = document.querySelectorAll('.content');
    containers.forEach(function (container) {
      var cols = getColumnCount();

      // Collect original image sources from existing structure
      var sources = [];
      // If already built masonry columns, read from them
      var existingCols = container.querySelectorAll('.masonry-col');
      if (existingCols.length > 0) {
        existingCols.forEach(function (col) {
          var imgs = col.querySelectorAll('img');
          imgs.forEach(function (img) {
            sources.push(img.getAttribute('src'));
          });
        });
      } else {
        // First run: read directly from container's img children
        var imgs = container.querySelectorAll(':scope > img');
        imgs.forEach(function (img) {
          sources.push(img.getAttribute('src'));
        });
      }

      if (sources.length === 0) return;

      // Clear the container
      container.innerHTML = '';

      // Create column divs
      var columnDivs = [];
      var columnHeights = [];
      for (var i = 0; i < cols; i++) {
        var colDiv = document.createElement('div');
        colDiv.className = 'masonry-col';
        container.appendChild(colDiv);
        columnDivs.push(colDiv);
        columnHeights.push(0);
      }

      // We need to load images to get their natural dimensions, then place them.
      // To keep the original order, we process sequentially: place image i
      // into the shortest column once its dimensions are known.
      var placed = 0;

      function placeNext() {
        if (placed >= sources.length) return;

        var idx = placed;
        var img = document.createElement('img');
        img.setAttribute('src', sources[idx]);
        img.setAttribute('data-index', idx);

        img.onload = function () {
          // Compute the rendered height: images are 100% width of column,
          // so rendered height = (naturalHeight / naturalWidth) * columnWidth.
          // All columns have the same width, so we just use the aspect ratio
          // to compare relative heights.
          var ratio = img.naturalHeight / img.naturalWidth;

          // Find the shortest column (left-to-right on ties)
          var minHeight = columnHeights[0];
          var targetCol = 0;
          for (var c = 1; c < cols; c++) {
            if (columnHeights[c] < minHeight) {
              minHeight = columnHeights[c];
              targetCol = c;
            }
          }

          columnDivs[targetCol].appendChild(img);
          columnHeights[targetCol] += ratio;

          placed++;
          placeNext();
        };

        img.onerror = function () {
          // Even on error, move to the shortest column so layout continues
          var minHeight = columnHeights[0];
          var targetCol = 0;
          for (var c = 1; c < cols; c++) {
            if (columnHeights[c] < minHeight) {
              minHeight = columnHeights[c];
              targetCol = c;
            }
          }
          columnDivs[targetCol].appendChild(img);
          columnHeights[targetCol] += 1; // assume square on error

          placed++;
          placeNext();
        };
      }

      placeNext();
    });
  }

  // Debounced resize: only rebuild on breakpoint change
  var resizeTimer = null;
  function handleResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      var newBp = getColumnCount();
      if (newBp !== lastBreakpoint) {
        lastBreakpoint = newBp;
        buildMasonry();
      }
    }, 150);
  }

  function init() {
    lastBreakpoint = getColumnCount();
    buildMasonry();
    window.addEventListener('resize', handleResize);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
