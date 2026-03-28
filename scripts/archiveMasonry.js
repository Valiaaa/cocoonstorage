// Masonry layout: place images into the shortest column, left-to-right on ties.
// Desktop (>768px): 3 columns with classic masonry layout
// Mobile (<=768px): 2-column grid with landscape items spanning full width
(function () {
  let lastBreakpoint = 0;

  function getColumnCount() {
    return window.innerWidth <= 768 ? 2 : 3;
  }

  function isMobile() {
    return window.innerWidth <= 768;
  }

  function getVideoAspectRatio(videoEl) {
    // Determine aspect ratio from video container classes
    if (videoEl.classList.contains('ratio-1-1')) return 1;
    if (videoEl.classList.contains('ratio-4-3')) return 4 / 3;
    if (videoEl.classList.contains('ratio-ultra-wide')) return 3728 / 1480;
    // Default is 16:9
    return 16 / 9;
  }

  function buildMasonry() {
    var containers = document.querySelectorAll('.content');
    containers.forEach(function (container) {
      // Skip containers that are not archive galleries
      if (container.classList.contains('home') ||
          container.classList.contains('about') ||
          container.classList.contains('project-content')) return;

      var cols = getColumnCount();
      var mobile = isMobile();

      // Collect items in DOM order (both images and videos)
      var items = []; // Each item: { type: 'img', src: '...' } or { type: 'video', element: ... }
      var existingCols = container.querySelectorAll('.masonry-col');
      if (existingCols.length > 0) {
        existingCols.forEach(function (col) {
          var imgs = col.querySelectorAll('img');
          imgs.forEach(function (img) {
            items.push({ type: 'img', src: img.getAttribute('src') });
          });
          var videos = col.querySelectorAll('.video-container');
          videos.forEach(function (video) {
            items.push({ type: 'video', element: video.cloneNode(true) });
          });
        });
      } else {
        // Traverse direct children in DOM order
        var children = container.children;
        for (var i = 0; i < children.length; i++) {
          var child = children[i];
          if (child.tagName === 'IMG') {
            items.push({ type: 'img', src: child.getAttribute('src') });
          } else if (child.classList && child.classList.contains('video-container')) {
            items.push({ type: 'video', element: child.cloneNode(true) });
          }
        }
      }

      if (items.length === 0) return;

      // Clear the container
      container.innerHTML = '';

      if (mobile) {
        // Mobile: Use grid layout with landscape detection
        // Process items sequentially
        var placed = 0;

        function placeNext() {
          if (placed >= items.length) return;

          var idx = placed;
          var item = items[idx];

          if (item.type === 'video') {
            // For video container, add as-is with masonry-item class
            var videoEl = item.element;
            videoEl.classList.add('masonry-item');

            // Check if landscape on mobile
            var aspectRatio = getVideoAspectRatio(videoEl);
            if (aspectRatio > 1) {
              videoEl.classList.add('masonry-landscape');
            }

            container.appendChild(videoEl);
            placed++;
            placeNext();
          } else {
            // For images, wait for load and check aspect ratio
            var img = document.createElement('img');
            img.setAttribute('src', item.src);
            img.setAttribute('data-index', idx);
            img.classList.add('lazy-fade', 'masonry-item');

            // Lazy load images beyond the first row
            if (idx >= cols) {
              img.setAttribute('loading', 'lazy');
            }

            img.onload = function () {
              var aspectRatio = img.naturalWidth / img.naturalHeight;

              // Determine if landscape on mobile (width > height, aspectRatio > 1)
              if (aspectRatio > 1) {
                img.classList.add('masonry-landscape');
              }

              container.appendChild(img);

              // Trigger fade-in after paint
              requestAnimationFrame(function () {
                img.classList.add('loaded');
              });

              placed++;
              placeNext();
            };

            img.onerror = function () {
              container.appendChild(img);
              img.classList.add('loaded');
              placed++;
              placeNext();
            };
          }
        }

        placeNext();
      } else {
        // Desktop: Use classic masonry with columns
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

        // Process items sequentially: place each into the shortest column
        var placed = 0;

        function placeNext() {
          if (placed >= items.length) return;

          var idx = placed;
          var item = items[idx];

          if (item.type === 'video') {
            // For video container, directly place with fixed aspect ratio
            var minHeight = columnHeights[0];
            var targetCol = 0;
            for (var c = 1; c < cols; c++) {
              if (columnHeights[c] < minHeight) {
                minHeight = columnHeights[c];
                targetCol = c;
              }
            }

            var videoEl = item.element;
            columnDivs[targetCol].appendChild(videoEl);
            
            var aspectRatio = getVideoAspectRatio(videoEl);
            columnHeights[targetCol] += 1 / aspectRatio; // height/width

            placed++;
            placeNext();
          } else {
            // For images, wait for load and calculate natural ratio
            var img = document.createElement('img');
            img.setAttribute('src', item.src);
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
        }

        placeNext();
      }
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
