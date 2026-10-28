// Keep project names on one line without clipping, including after fonts load.
(() => {
  const selector = '.featured-project .project-title-link h1, #project-title';
  const observed = new WeakSet();
  let frame;

  function schedule() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(fitTitles);
  }

  const resizeObserver = new ResizeObserver(schedule);

  function fitTitles() {
    document.querySelectorAll(selector).forEach(title => {
      if (!observed.has(title.parentElement)) {
        resizeObserver.observe(title.parentElement);
        observed.add(title.parentElement);
      }

      title.style.removeProperty('font-size');
      const baseSize = parseFloat(getComputedStyle(title).fontSize);
      if (!title.clientWidth || title.scrollWidth <= title.clientWidth) return;

      let low = 0;
      let high = baseSize;
      // Find the largest size that fits the available title width.
      for (let step = 0; step < 12; step++) {
        const size = (low + high) / 2;
        title.style.fontSize = `${size}px`;
        if (title.scrollWidth <= title.clientWidth) low = size;
        else high = size;
      }
      title.style.fontSize = `${low}px`;
    });
  }

  new MutationObserver(schedule).observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
  window.addEventListener('resize', schedule);
  document.addEventListener('load', event => {
    if (event.target.matches?.('link[rel="stylesheet"]')) schedule();
  }, true);
  document.fonts.ready.then(schedule);
  document.fonts.addEventListener('loadingdone', schedule);
  schedule();
})();
