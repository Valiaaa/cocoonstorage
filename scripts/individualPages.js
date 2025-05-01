document.addEventListener("DOMContentLoaded", async () => {
  const scriptTag = document.querySelector('script[data-project]');
  const projectName = scriptTag.dataset.project;

  const basePath = "../../";
  const projectPath = `../${projectName}/`;

  const templateRes = await fetch(`${basePath}components/projectTemplate.html`);
  const templateHtml = await templateRes.text();
  document.body.innerHTML = templateHtml;

  document.title = "Valia Liu";
  const headMeta = document.createElement("meta");
  headMeta.name = "viewport";
  headMeta.content = "width=device-width, initial-scale=1.0";
  document.head.appendChild(headMeta);

  ["base.css", "project.css", "navigation.css"].forEach(file => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `${basePath}styles/${file}`;
    document.head.appendChild(link);
  });

  const favicon = document.createElement("link");
  favicon.rel = "icon";
  favicon.href = `${basePath}assets/icons/icon.png`;
  document.head.appendChild(favicon);

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


  const jqueryScript = document.createElement("script");
  jqueryScript.src = "https://code.jquery.com/jquery-3.6.0.min.js";
  jqueryScript.onload = () => {

    // ✅ 加载导航栏
    $("#navigation").load(`${basePath}components/navigation.html`, function () {
      $.getScript(`${basePath}scripts/navigation.js`, function () {
        if (typeof bindNavigationEvents === "function") {
          bindNavigationEvents();
        }
      });
    });

    // ✅ 加载媒体内容
    $("#project-media").load(`${projectPath}media.html`, function () {
      console.log("✅ project-media content loaded");
    
      const mediaLayoutScript = document.createElement("script");
      mediaLayoutScript.src = `${basePath}scripts/mediaLayout.js`;
      mediaLayoutScript.onload = () => {
        console.log("✅ mediaLayout.js successfully loaded and executed");
        layoutMediaPairsByHeight();
      };
      document.body.appendChild(mediaLayoutScript);
    });    

    // ✅ 加载其他项目信息
    const gsapScript = document.createElement("script");
    gsapScript.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js";
    document.body.appendChild(gsapScript);

    const projectScript = document.createElement("script");
    projectScript.src = `${basePath}scripts/loadProject.js`;
    projectScript.onload = () => {
      fetch(`${basePath}archive/data.json`)
        .then(res => res.json())
        .then(data => {
          const project = data.projects.find(p => p.filename === projectName);
          if (!project) return;

          document.getElementById("project-title").textContent = project.title;
          document.getElementById("project-description").innerHTML = project.description || "";

          ["medium", "dimension", "date", "collaborator"].forEach(field => {
            const block = document.querySelector(`.data-block[data-field="${field}"]`);
            const valueEl = document.getElementById(field);
            const labelEl = document.getElementById("title-" + field);
            const content = project[field];

            let displayContent = "";
            if (Array.isArray(content)) {
              displayContent = content.join(", ");
            } else if (typeof content === "string") {
              displayContent = content.trim();
            }

            if (displayContent) {
              if (valueEl) valueEl.textContent = displayContent;
              if (labelEl) labelEl.style.display = "block";
              if (valueEl) valueEl.style.display = "block";
              if (block) block.style.display = "block";
            } else {
              if (labelEl) labelEl.style.display = "none";
              if (valueEl) valueEl.style.display = "none";
              if (block) block.style.display = "none";
            }
          });
        });
    };
    document.body.appendChild(projectScript);
  };

  document.head.appendChild(jqueryScript);
});