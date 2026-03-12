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
      // Skip containers that are not archive galleries
      if (container.classList.contains('home') ||
          container.classList.contains('about') ||
          container.classList.contains('project-content')) return;

      var cols = getColumnCount();

      // Collect original image sources from existing structure
      var sources = [];
      var existingCols = container.querySelectorAll('.masonry-col');
      if (existingCols.length > 0) {
        existingCols.forEach(function (col) {
          var imgs = col.querySelectorAll('img');
          imgs.forEach(function (img) {
            sources.push(img.getAttribute('src'));
          });
        });
      } else {
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

      // Process images sequentially: place each into the shortest column
      var placed = 0;

      function placeNext() {
        if (placed >= sources.length) return;

        var idx = placed;
        var img = document.createElement('img');
        img.setAttribute('src', sources[idx]);
        img.setAttribute('data-index', idx);
        img.classList.add('lazy-fade');

        // Lazy load images beyond the first row
        if (idx >= cols) {
          img.setAttribute('loading', 'lazy');
        }

        img.onload = function () {
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

          // Trigger fade-in after paint
          requestAnimationFrame(function () {
            img.classList.add('loaded');
          });

          placed++;
          placeNext();
        };

        img.onerror = function () {
          var minHeight = columnHeights[0];
          var targetCol = 0;
          for (var c = 1; c < cols; c++) {
            if (columnHeights[c] < minHeight) {
              minHeight = columnHeights[c];
              targetCol = c;
            }
          }
          columnDivs[targetCol].appendChild(img);
          columnHeights[targetCol] += 1;
          img.classList.add('loaded');

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
