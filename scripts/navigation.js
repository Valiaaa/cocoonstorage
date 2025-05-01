function getScriptBasePath() {
    let scriptSrc = document.currentScript ? document.currentScript.src : "";
    return scriptSrc.substring(0, scriptSrc.lastIndexOf("/") + 1);
  }
  
  const basePath = getScriptBasePath();
  console.log("📂 Detected JS Base Path:", basePath);
  
  // ✅ 自动识别路径深度（兼容首页与子页面）
  const depthPrefix = window.location.pathname.includes("/archive/") ? "../../" : "./";
  
  function bindNavigationEvents() {
    const currentPage = window.location.pathname.split('/').pop();
    const checkboxes = document.querySelectorAll(".category input[type='checkbox']");
    const allButton = document.getElementById("all");
    const clearButton = document.getElementById("clear");
    const goHome = document.getElementById("go-home");
    const about = document.getElementById("about");
    const archive = document.getElementById("archive");
  
    checkboxes.forEach(cb => {
      cb.addEventListener("change", () => {
        const selectedCategories = Array.from(checkboxes)
          .filter(c => c.checked)
          .map(c => c.id.replace('c', '').trim());
  
        if (currentPage === 'filter.html') {
          applyFilter();
        } else {
          const targetPage = selectedCategories.length
            ? depthPrefix + "filter.html?filter=" + selectedCategories.join(",")
            : depthPrefix + "index.html";
          window.location.href = targetPage;
        }
      });
    });
  
    if (goHome) {
      goHome.addEventListener("click", e => {
        e.preventDefault();
    
        if (window.innerWidth <= 768) {
          checkboxes.forEach(cb => cb.checked = true);
          const allCategories = Array.from(checkboxes).map(cb => cb.id.replace('c', '').trim());
    
          if (currentPage === 'filter.html') {
            applyFilter();
          } else {
            setTimeout(() => {
              window.location.href = depthPrefix + "filter.html?filter=" + allCategories.join(",");
            }, 50);
          }
        } else {
          window.location.href = depthPrefix + "index.html";
        }
      });
    }    
  
    if (clearButton) {
      clearButton.addEventListener("click", () => {
        window.location.href = depthPrefix + "index.html";
      });
    }
    
    if (allButton) {
      allButton.addEventListener("click", e => {
        e.preventDefault();
        checkboxes.forEach(cb => cb.checked = true);
        const allCategories = Array.from(checkboxes).map(cb => cb.id.replace('c', '').trim());
  
        if (currentPage === 'filter.html') {
          applyFilter();
        } else {
          setTimeout(() => {
            window.location.href = depthPrefix + "filter.html?filter=" + allCategories.join(",");
          }, 50);
        }
      });
    }

    if (archive) {
      archive.addEventListener("click", () => {
        window.location.href = depthPrefix + "archive.html";
      });
    }
  
    if (about) {
      about.addEventListener("click", () => {
        window.location.href = depthPrefix + "about.html";
      });
    }
  
    const urlParams = new URLSearchParams(window.location.search);
    const selectedFilters = urlParams.get("filter") ? urlParams.get("filter").split(",") : [];
    checkboxes.forEach(cb => {
      const category = cb.id.replace('c', '').trim();
      cb.checked = selectedFilters.includes(category);
    });
  
    if (currentPage === 'filter.html') applyFilter();
  
    const hamburgerMenu = document.querySelector(".hamburger-menu");
    if (hamburgerMenu) {
      hamburgerMenu.addEventListener("click", function () {
        this.classList.toggle("expanded");
        document.getElementById("navigation").classList.toggle("expanded");
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
        }
      }
    }, { passive: true });
  }
  
  function applyFilter() {
    const checkboxes = document.querySelectorAll(".category input[type='checkbox']");
    const selectedCategories = Array.from(checkboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.id.replace('c', '').trim());
  
    const allWorks = document.querySelectorAll('.work');
  
    if (selectedCategories.length === 0) {
      allWorks.forEach(work => work.classList.add('hidden'));
      updateURL([]);
      window.location.href = depthPrefix + "index.html";
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