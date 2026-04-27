/* ============================================================
   Navigation click sound — "blur" from @web-kits/audio core
   Loaded inline so it works on every page without extra <script> tags.
   ============================================================ */
(function initNavSound() {
  let _navPatch = null;
  let _navAudioReady = false;

  const blurPatch = {
    name: "nav-blur",
    author: "Raphael Salaja",
    version: "3.1.0",
    description: "Navigation click sound",
    sounds: {
      blur: {
        source: {
          type: "sine",
          frequency: 1100,
          fm: { ratio: 0.5, depth: 30 }
        },
        envelope: { attack: 0, decay: 0.018, sustain: 0, release: 0.008 },
        gain: 0.04
      }
    }
  };

  import("https://esm.sh/@web-kits/audio@0.1.0").then(function (mod) {
    _navPatch = mod.definePatch(blurPatch);

    // Try immediate unlock
    try { mod.ensureReady().then(function () { _navAudioReady = true; }); } catch (_) {}

    // Unlock on earliest user gestures
    var unlock = function () {
      if (_navAudioReady) return;
      mod.ensureReady().then(function () { _navAudioReady = true; }).catch(function () {});
    };
    ["mousedown", "pointerdown", "keydown", "touchstart"].forEach(function (evt) {
      document.addEventListener(evt, unlock, { once: true, capture: true });
    });
  }).catch(function () {});

  // Expose globally for navigation.js to call
  window._playNavBlur = function () {
    if (_navPatch && _navAudioReady) {
      try {
        _navPatch.play("blur", {
          detune: (Math.random() - 0.5) * 120,
          volume: 0.85 + Math.random() * 0.3
        });
      } catch (_) {}
    }
  };
})();

function getScriptBasePath() {
    let scriptSrc = document.currentScript ? document.currentScript.src : "";
    return scriptSrc.substring(0, scriptSrc.lastIndexOf("/") + 1);
  }

  const basePath = getScriptBasePath();

  // 自动识别路径深度（兼容首页与子页面）
  const depthPrefix = window.location.pathname.includes("/archive/") ? "../../" : "./";

  // Helper: navigate with page transition if available
  function goTo(url) {
    if (typeof navigateWithTransition === "function") {
      navigateWithTransition(url);
    } else {
      window.location.href = url;
    }
  }

  function bindNavigationEvents() {
    const currentPage = window.location.pathname.split('/').pop();
    const checkboxes = document.querySelectorAll(".category input[type='checkbox']");
    const allButton = document.getElementById("all");
    const clearButton = document.getElementById("clear");
    const goHome = document.getElementById("go-home");
    const about = document.getElementById("about");
    const archive = document.getElementById("archive");
    const shelf = document.getElementById("shelf");
    const workCategories = document.querySelector(".work-categories");

    // Collapse work-categories on archive / journal / shelf after page load
    if (workCategories) {
      if (currentPage === 'archive.html' || currentPage === 'journal.html' || currentPage === 'shelf.html') {
        const doCollapse = () => {
          setTimeout(() => {
            workCategories.classList.add('collapsed');
          }, 100);
        };
        
        if (document.readyState === 'complete') {
          doCollapse();
        } else {
          window.addEventListener('load', doCollapse);
        }
      } else {
        workCategories.classList.remove('collapsed');
      }
    }

    checkboxes.forEach(cb => {
      cb.addEventListener("change", () => {
        const selectedCategories = Array.from(checkboxes)
          .filter(c => c.checked)
          .map(c => c.id.trim());

        if (currentPage === 'filter.html') {
          applyFilter();
        } else {
          const targetPage = selectedCategories.length
            ? depthPrefix + "filter.html?filter=" + selectedCategories.join(",")
            : depthPrefix + "index.html";
          goTo(targetPage);
        }
      });
    });

    if (goHome) {
      goHome.addEventListener("click", e => {
        e.preventDefault();
        if (typeof _playNavBlur === 'function') _playNavBlur();

        if (window.innerWidth <= 768) {
          checkboxes.forEach(cb => cb.checked = true);
          const allCategories = Array.from(checkboxes).map(cb => cb.id.trim());

          if (currentPage === 'filter.html') {
            applyFilter();
          } else {
            setTimeout(() => {
              goTo(depthPrefix + "filter.html?filter=" + allCategories.join(","));
            }, 50);
          }
        } else {
          goTo(depthPrefix + "index.html");
        }
      });
    }

    if (clearButton) {
      clearButton.addEventListener("click", () => {
        goTo(depthPrefix + "index.html");
      });
    }

    if (allButton) {
      allButton.addEventListener("click", e => {
        e.preventDefault();
        checkboxes.forEach(cb => cb.checked = true);
        const allCategories = Array.from(checkboxes).map(cb => cb.id.trim());

        if (currentPage === 'filter.html') {
          applyFilter();
        } else {
          setTimeout(() => {
            goTo(depthPrefix + "filter.html?filter=" + allCategories.join(","));
          }, 50);
        }
      });
    }

    if (archive) {
      archive.addEventListener("click", () => {
        if (typeof _playNavBlur === 'function') _playNavBlur();
        goTo(depthPrefix + "archive.html");
      });
    }

    if (shelf) {
      shelf.addEventListener("click", () => {
        if (typeof _playNavBlur === 'function') _playNavBlur();
        goTo(depthPrefix + "shelf.html");
      });
    }

    if (about) {
      about.addEventListener("click", () => {
        if (typeof _playNavBlur === 'function') _playNavBlur();
        goTo(depthPrefix + "about.html");
      });
    }

    const urlParams = new URLSearchParams(window.location.search);
    const selectedFilters = urlParams.get("filter") ? urlParams.get("filter").split(",") : [];
    checkboxes.forEach(cb => {
      const category = cb.id.trim();
      cb.checked = selectedFilters.includes(category);
    });

    if (currentPage === 'filter.html') applyFilter();

    const hamburgerMenu = document.querySelector(".hamburger-menu");
    if (hamburgerMenu) {
      hamburgerMenu.addEventListener("click", function () {
        this.classList.toggle("expanded");
        const nav = document.getElementById("navigation");
        nav.classList.toggle("expanded");
        document.body.classList.toggle("nav-open");
      });
    }

    document.addEventListener("touchstart", function (e) {
      const nav = document.getElementById("navigation");
      if (nav?.classList.contains("expanded")) {
        const clickInsideNav = nav.contains(e.target);
        const clickHamburger = hamburgerMenu?.contains(e.target);
        if (!clickInsideNav && !clickHamburger) {
          nav.classList.remove("expanded");
          hamburgerMenu?.classList.remove("expanded");
          document.body.classList.remove("nav-open");
        }
      }
    }, { passive: true });
  }

  function applyFilter() {
    const checkboxes = document.querySelectorAll(".category input[type='checkbox']");
    const selectedCategories = Array.from(checkboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.id.trim());

    // 检查是否在 filter.html 页面
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'filter.html') {
      // 在 filter page 上，直接更新 URL 并重新渲染
      if (selectedCategories.length === 0) {
        goTo(depthPrefix + "index.html");
        return;
      }

      const newURL = selectedCategories.length
        ? `${window.location.pathname}?filter=${selectedCategories.join(",")}`
        : window.location.pathname;
      window.history.replaceState({}, '', newURL);
      
      // 调用 renderProjects 重新渲染
      if (typeof renderProjects === "function") {
        renderProjects();
      }
      return;
    }

    // 在其他页面（如首页）上的旧逻辑
    const allWorks = document.querySelectorAll('.work');

    if (selectedCategories.length === 0) {
      allWorks.forEach(work => work.classList.add('hidden'));
      updateURL([]);
      goTo(depthPrefix + "index.html");
      return;
    }

    if (selectedCategories.includes('all')) {
      allWorks.forEach(work => work.classList.remove('hidden'));
      updateURL([]);
    } else {
      allWorks.forEach(work => {
        const match = selectedCategories.some(cat => work.classList.contains(cat));
        work.classList.toggle('hidden', !match);
      });
      updateURL(selectedCategories);
    }
  }

  function updateURL(categories) {
    const newURL = categories.length
      ? `${window.location.pathname}?filter=${categories.join(",")}`
      : window.location.pathname;

    history.replaceState({}, "", newURL);
  }
