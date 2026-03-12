function layoutMediaPairsByHeight() {
  const pairs = document.querySelectorAll('.media-pair');

  pairs.forEach((pair, index) => {
    const items = Array.from(pair.querySelectorAll('.media-box'));

    const container = pair.closest(".media-container") || pair.parentElement;
    const containerWidth = container.clientWidth;
    const gap = parseFloat(getComputedStyle(pair).gap || "0");
    const totalAvailable = containerWidth - gap;

    if (window.innerWidth <= 768) {
      items.forEach((item, i) => {
        item.style.display = "block";
        item.style.width = "100%";
        item.style.minHeight = "auto";
      });
      return;
    }

    // Set default widths to prevent flash of unstyled content
    items.forEach((item) => {
      item.style.width = `${containerWidth / items.length}px`;
      item.style.flex = "0 0 auto";
      item.style.height = "auto";

      const media = item.querySelector("img") || item.querySelector("iframe");
      if (media) {
        media.style.width = "100%";
        media.style.height = "100%";
        media.style.objectFit = "cover";
      }
    });

    // Wait for all media to load before calculating ratios
    Promise.all(items.map((item, i) => {
      return new Promise(resolve => {
        const media = item.querySelector("img") || item.querySelector("iframe");
        if (!media) {
          return resolve();
        }

        if (media.tagName === "IMG") {
          if (media.complete) {
            resolve();
          } else {
            media.onload = () => resolve();
            media.onerror = () => resolve();
          }
        } else {
          resolve();
        }
      });
    })).then(() => {
      const ratios = items.map((item, i) => {
        const media = item.querySelector("img") || item.querySelector("iframe");
        if (media && media.tagName === "IMG" && media.naturalWidth && media.naturalHeight) {
          return media.naturalWidth / media.naturalHeight;
        } else if (media && media.tagName === "IFRAME") {
          const classList = media.classList;
          if (classList.contains("ratio-1-1")) return 1;
          if (classList.contains("ratio-4-3")) return 4 / 3;
          if (classList.contains("ratio-16-9")) return 16 / 9;
          return 16 / 9;
        }
        return 1;
      });

      const totalRatio = ratios.reduce((sum, r) => sum + r, 0);

      items.forEach((item, i) => {
        const pixelWidth = (ratios[i] / totalRatio) * totalAvailable;
        item.style.setProperty("width", `${pixelWidth}px`, "important");
        item.style.flex = "0 0 auto";
        item.style.height = "auto";

        const media = item.querySelector("img") || item.querySelector("iframe");
        if (media) {
          media.style.width = "100%";
          media.style.height = "100%";
          media.style.objectFit = "cover";
        }
      });
    });
  });
}

let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    layoutMediaPairsByHeight();
  }, 100);
});