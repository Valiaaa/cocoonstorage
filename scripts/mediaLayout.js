function layoutMediaPairsByHeight() {
  const pairs = document.querySelectorAll('.media-pair');
  console.log(`🧠 [layoutMediaPairsByHeight] Found ${pairs.length} media pairs`);

  pairs.forEach((pair, index) => {
    const items = Array.from(pair.querySelectorAll('.media-box'));
    console.log(`🔎 [Pair ${index}] Found ${items.length} media-boxes`);

    const container = pair.closest(".media-container") || pair.parentElement;
    const containerWidth = container.clientWidth;
    const gap = parseFloat(getComputedStyle(pair).gap || "0");
    const totalAvailable = containerWidth - gap;

    if (window.innerWidth <= 768) {
      items.forEach((item, i) => {
        item.style.display = "block";
        item.style.width = "100%";
        item.style.minHeight = "auto"; // 可加 fallback 高度比如 100px 看测试情况
      });
      return; // 提前退出不再处理 ratio
    }    

    // ⚡ 优化1：预先铺设默认宽度，避免内容闪闪
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

    // 📦 等待所有媒体资源加载完成
    Promise.all(items.map((item, i) => {
      return new Promise(resolve => {
        const media = item.querySelector("img") || item.querySelector("iframe");
        if (!media) {
          console.warn(`⚠️ [Pair ${index}, Item ${i}] No media found`);
          return resolve();
        }

        if (media.tagName === "IMG") {
          if (media.complete) {
            console.log(`📷 [Pair ${index}, Item ${i}] IMG is loaded`);
            resolve();
          } else {
            media.onload = () => {
              console.log(`📷 [Pair ${index}, Item ${i}] IMG onload triggered`);
              resolve();
            };
            media.onerror = () => resolve();
          }
        } else {
          console.log(`🎞 [Pair ${index}, Item ${i}] IFRAME assumed ready`);
          resolve();
        }
      });
    })).then(() => {
      const ratios = items.map((item, i) => {
        const media = item.querySelector("img") || item.querySelector("iframe");
        if (media && media.tagName === "IMG" && media.naturalWidth && media.naturalHeight) {
          const r = media.naturalWidth / media.naturalHeight;
          console.log(`🖐 [Pair ${index}, Item ${i}] IMG ratio: ${r.toFixed(2)}`);
          return r;
        } else if (media && media.tagName === "IFRAME") {
          const classList = media.classList;
          if (classList.contains("ratio-1-1")) return 1;
          if (classList.contains("ratio-4-3")) return 4 / 3;
          if (classList.contains("ratio-16-9")) return 16 / 9;

          console.log(`🖐 [Pair ${index}, Item ${i}] IFRAME default ratio: 16:9`);
          return 16 / 9;
        }
        console.warn(`⚠️ [Pair ${index}, Item ${i}] No valid ratio, fallback to 1:1`);
        return 1;
      });

      const totalRatio = ratios.reduce((sum, r) => sum + r, 0);
      console.log(`↕️ [Pair ${index}] Ratios calculated:`, ratios);
      console.log("📏 [Pair " + index + "] container width is:", containerWidth);

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

        console.log(`✅ [Pair ${index}, Item ${i}] Set width ${pixelWidth.toFixed(2)}px for ratio ${ratios[i].toFixed(2)}`);
      });
    });
  });
}

let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    console.log("🔁 Resized → recalculating layout...");
    layoutMediaPairsByHeight();
  }, 100);
});