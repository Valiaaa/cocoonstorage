// Page transition: fade out before navigating, fade in handled by CSS animation on body
(function () {
  var FADE_OUT_MS = 200;

  function doTransition(url) {
    document.body.classList.add('page-leaving');
    setTimeout(function () {
      window.location.href = url;
    }, FADE_OUT_MS);
  }

  // Expose globally so navigation.js and other scripts can use it
  window.navigateWithTransition = doTransition;

  // Intercept internal <a> link clicks
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a');
    if (!link) return;

    // Skip external links, mailto, tel, javascript, anchors, new-tab links
    var href = link.getAttribute('href');
    if (!href) return;
    if (link.target === '_blank') return;
    if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:') || href.startsWith('#')) return;

    // Skip links with explicit no-transition class
    if (link.classList.contains('no-transition')) return;

    // Only intercept same-origin navigations
    try {
      var url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;
    } catch (_) {
      return;
    }

    e.preventDefault();
    doTransition(href);
  });

  // Handle browser back/forward: ensure page is visible when returning via bfcache
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      document.body.classList.remove('page-leaving');
      document.body.style.opacity = '';
    }
  });
})();
