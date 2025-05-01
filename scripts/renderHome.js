document.addEventListener('DOMContentLoaded', function(){
  fetch(basePath + "../archive/data.json")
    .then(response => response.json())
    .then(data => {
      const featuredContainer = document.querySelector('.featured-projects');
      featuredContainer.innerHTML = '';

      const featuredProjects = data.projects.filter(project => project.feature);

      featuredProjects.forEach((project, index) => {
        const isLast = index === featuredProjects.length - 1 ? 'is-last' : '';      
        const folderName = project.filename;
        const projectLink = "archive/" + folderName + "/" + folderName + ".html";

        let mediaContent = '';
        const mediaItems = [];

        let ratioClass = "ratio-16-9";
        if (project.videoRatio === "1-1") ratioClass = "ratio-1-1";
        else if (project.videoRatio === "4-3") ratioClass = "ratio-4-3";

        const hasCover = !!project.cover || !!project.cover2;
        const isPureVideo = project.video && !hasCover;

        if (project.video) {
          if (isPureVideo) {
            // 单独视频结构，iframe 不带比例类（绝对不要加比例类）
            let wrapperClass = "video-wrapper";
            if (project.videoRatio === "1-1") wrapperClass += " square";
            else if (project.videoRatio === "4-3") wrapperClass += " fourthree";
            else if (project.videoRatio === "16-9") wrapperClass += " ratio-16-9";
        
            mediaItems.push(
              '<div class="' + wrapperClass + '">' +
              '<iframe src="' + project.video + '" frameborder="0" allow="autoplay; fullscreen" allowfullscreen title="' + project.title + '"></iframe>' +
              '</div>'
            );
          } else {
            // 两个媒体项目或有cover时iframe需要比例类（只在这里加比例类）
            mediaItems.push(
              '<div class="media-box">' +
              '<iframe class="' + ratioClass + '" src="' + project.video + '" frameborder="0" allow="autoplay; fullscreen" allowfullscreen title="' + project.title + '"></iframe>' +
              '</div>'
            );
          }
        }                     

        if (project.cover) {
          const coverHTML = '<img class="media-item" src="archive/' + folderName + '/' + project.cover + '" alt="' + project.title + ' - cover">';
          mediaItems.push((project.video || project.cover2) ? '<div class="media-box">' + coverHTML + '</div>' : coverHTML);
        }

        if (project.cover2) {
          const cover2HTML = '<img class="media-item" src="archive/' + folderName + '/' + project.cover2 + '" alt="' + project.title + ' - cover2">';
          mediaItems.push('<div class="media-box">' + cover2HTML + '</div>');
        }

        // 只显示一个 media item on mobile
        if (window.innerWidth <= 768 && mediaItems.length > 1) {
          mediaItems.splice(1);
        }

        const boxCount = mediaItems.filter(item => item.includes("media-box")).length;
        if (boxCount >= 2) {
          mediaContent = '<div class="media-pair">' + mediaItems.join("") + '</div>';
        } else {
          mediaContent = mediaItems.join("");
        }

        const TWO_LINE_CHAR_COUNT = 14;
        const isTwoLine = project.title.length > TWO_LINE_CHAR_COUNT ? 'two-line' : '';

        const html =
          '<a href="' + projectLink + '" class="featured-project-link">' +
            '<div class="featured-project ' + isLast + '">' +
              '<div class="media-container" style="width: 100%;">' + mediaContent + '</div>' +
              '<div class="project-info">' +
                '<h1>' + project.title + '</h1>' +
                '<h2 class="' + isTwoLine + '">' + (project.medium || '') + '</h2>' +
              '</div>' +
            '</div>' +
          '</a>';

        featuredContainer.insertAdjacentHTML('beforeend', html);
      });

      document.querySelectorAll(".project-info").forEach(info => {
        const h1 = info.querySelector("h1");
        const h2 = info.querySelector("h2");

        if (h1 && h2) {
          h1.addEventListener("mouseenter", () => {
            h2.classList.add("hover-effect");
            h1.classList.add("hover-effect");
          });
          h1.addEventListener("mouseleave", () => {
            h2.classList.remove("hover-effect");
            h1.classList.remove("hover-effect");
          });

          h2.addEventListener("mouseenter", () => {
            h1.classList.add("hover-effect");
            h2.classList.add("hover-effect");
          });
          h2.addEventListener("mouseleave", () => {
            h1.classList.remove("hover-effect");
            h2.classList.remove("hover-effect");
          });
        }
      });

      const mediaLayoutScript = document.createElement("script");
      mediaLayoutScript.src = basePath + "mediaLayout.js";
      document.body.appendChild(mediaLayoutScript);
      
      mediaLayoutScript.onload = () => {
        setTimeout(() => {
          const mediaElements = document.querySelectorAll(".media-pair img, .media-pair iframe");
          const promises = Array.from(mediaElements).map(media => {
            return new Promise(resolve => {
              if (media.tagName === "IMG") {
                if (media.complete) return resolve();
                media.onload = () => resolve();
                media.onerror = () => resolve();
              } else {
                resolve();
              }
            });
          });

          Promise.all(promises).then(() => {
            console.log("📦 All media loaded, triggering layout");
            layoutMediaPairsByHeight();
          });
        }, 100);
      };
    });
});