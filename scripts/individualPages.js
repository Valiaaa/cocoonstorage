document.addEventListener("DOMContentLoaded", async () => {
  const scriptTag = document.querySelector('script[data-project]');
  const projectName = scriptTag.dataset.project;

  const basePath = "../../";
  const projectPath = `../${projectName}/`;

  const templateRes = await fetch(`${basePath}components/projectTemplate.html`);
  const templateHtml = await templateRes.text();
  document.body.innerHTML = templateHtml;

  // Keep body hidden until CSS loads and fade-in animation takes over
  document.body.style.opacity = "0";

  document.title = "Work - Valia Liu"; // fallback until data loads
  const headMeta = document.createElement("meta");
  headMeta.name = "viewport";
  headMeta.content = "width=device-width, initial-scale=1.0";
  document.head.appendChild(headMeta);

  ["base.css", "project.css", "navigation.css"].forEach(file => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `${basePath}styles/${file}`;
    // Once base.css loads, clear inline opacity and re-trigger fade-in animation
    if (file === "base.css") {
      link.onload = () => {
        document.body.style.opacity = "";
        document.body.style.animation = "none";
        void document.body.offsetHeight;
        document.body.style.animation = "";
      };
    }
    document.head.appendChild(link);
  });

  // Inject Google Fonts (same as root pages via <link>)
  const preconnect1 = document.createElement("link");
  preconnect1.rel = "preconnect";
  preconnect1.href = "https://fonts.googleapis.com";
  document.head.appendChild(preconnect1);

  const preconnect2 = document.createElement("link");
  preconnect2.rel = "preconnect";
  preconnect2.href = "https://fonts.gstatic.com";
  preconnect2.crossOrigin = "anonymous";
  document.head.appendChild(preconnect2);

  const interFont = document.createElement("link");
  interFont.rel = "stylesheet";
  interFont.href = "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap";
  document.head.appendChild(interFont);

  const favicon = document.createElement("link");
  favicon.rel = "icon";
  favicon.href = `${basePath}assets/icons/icon.png`;
  document.head.appendChild(favicon);

  const appleTouchIcon = document.createElement("link");
  appleTouchIcon.rel = "apple-touch-icon";
  appleTouchIcon.sizes = "180x180";
  appleTouchIcon.href = "/icon-180.png";
  document.head.appendChild(appleTouchIcon);

  const gtagScript = document.createElement("script");
  gtagScript.async = true;
  gtagScript.src = "https://www.googletagmanager.com/gtag/js?id=G-YB3PB2KE3B";
  document.head.appendChild(gtagScript);

  const gtagInit = document.createElement("script");
  gtagInit.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-YB3PB2KE3B');
  `;
  document.head.appendChild(gtagInit);

  // Helper: load a script and return a promise
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.body.appendChild(s);
    });
  }

  // Load navigation
  fetch(`${basePath}components/navigation.html`)
    .then(r => r.text())
    .then(html => {
      document.getElementById("navigation").innerHTML = html;
      return loadScript(`${basePath}scripts/pageTransition.js`);
    })
    .then(() => loadScript(`${basePath}scripts/navigation.js`))
    .then(() => {
      if (typeof bindNavigationEvents === "function") {
        bindNavigationEvents();
      }
      // Load color theme script after navigation is loaded
      return loadScript(`${basePath}scripts/colorTheme.js`);
    });

  // Load media content
  fetch(`${projectPath}media.html`)
    .then(r => r.text())
    .then(html => {
      document.getElementById("project-media").innerHTML = html;
      return loadScript(`${basePath}scripts/mediaLayout.js`);
    })
    .then(() => {
      layoutMediaPairsByHeight();
    });

  // Load project data
  fetch(`${basePath}assets/json/data.json`)
    .then(res => res.json())
    .then(data => {
      const project = data.projects.find(p => p.filename === projectName);
      if (!project) return;

      document.title = `${project.title} - Valia Liu`;
      document.getElementById("project-title").textContent = project.title;
      document.getElementById("project-description").innerHTML = project.description || "";

      ["medium", "dimension", "date", "credit"].forEach(field => {
        const block = document.querySelector(`.data-block[data-field="${field}"]`);
        const valueEl = document.getElementById(field);
        const labelEl = document.getElementById("title-" + field);
        const content = project[field];

        let displayContent = "";
        if (Array.isArray(content)) {
          if (field === "credit") {
            // 对credit进行特殊处理：用<br>分割，括号内容italicize
            displayContent = content.map(item => {
              // 把 (xxx) 替换成 <i>(xxx)</i>
              return item.replace(/\(([^)]*)\)/g, '<i>($1)</i>');
            }).join("<br>");
          } else {
            displayContent = content.join(", ");
          }
        } else if (typeof content === "string") {
          displayContent = content.trim();
        }

        if (displayContent) {
          if (valueEl) {
            if (field === "credit") {
              valueEl.innerHTML = displayContent; // credit使用innerHTML以支持<br>和<i>标签
            } else {
              valueEl.textContent = displayContent;
            }
          }
          if (labelEl) labelEl.style.display = "block";
          if (valueEl) valueEl.style.display = "block";
          if (block) block.style.display = "block";
        } else {
          if (labelEl) labelEl.style.display = "none";
          if (valueEl) valueEl.style.display = "none";
          if (block) block.style.display = "none";
        }
      });

      // Handle tags separately
      const tagsBlock = document.querySelector(`.data-block[data-field="tags"]`);
      const tagsContainer = document.getElementById("tags");
      const tagsLabel = document.getElementById("title-tags");
      const tags = project.tags;

      if (tags && Array.isArray(tags) && tags.length > 0) {
        tagsContainer.innerHTML = tags.join(", ");
        if (tagsLabel) tagsLabel.style.display = "block";
        if (tagsContainer) tagsContainer.style.display = "block";
        if (tagsBlock) tagsBlock.style.display = "block";
      } else {
        if (tagsLabel) tagsLabel.style.display = "none";
        if (tagsContainer) tagsContainer.style.display = "none";
        if (tagsBlock) tagsBlock.style.display = "none";
      }
    });

  // Load custom cursor
  loadScript(`${basePath}scripts/customCursor.js`);
});
