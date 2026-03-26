document.addEventListener('DOMContentLoaded', function(){
  fetch("archive/data.json")
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
          const coverHTML = '<img class="media-item hoverZoom lazy-fade" loading="lazy" src="archive/' + folderName + '/' + project.cover + '" alt="' + project.title + ' - cover" onload="this.classList.add(\'loaded\')">'
          mediaItems.push('<div class="media-box hoverZoom">' + coverHTML + '</div>');
        }

        if (project.cover2) {
          const cover2HTML = '<img class="media-item hoverZoom lazy-fade" loading="lazy" src="archive/' + folderName + '/' + project.cover2 + '" alt="' + project.title + ' - cover2" onload="this.classList.add(\'loaded\')">'
          mediaItems.push('<div class="media-box hoverZoom">' + cover2HTML + '</div>');
        }

        const boxCount = mediaItems.filter(item => item.includes("media-box")).length;
        if (boxCount >= 2) {
          mediaContent = '<div class="media-pair">' + mediaItems.join("") + '</div>';
        } else {
          mediaContent = mediaItems.join("");
        }

        let tagsHTML = '';
        if (project.tags && Array.isArray(project.tags) && project.tags.length > 0) {
          tagsHTML = project.tags.map(tag => 
            '<span class="tag-secondary">' + tag + '</span>'
          ).join('');
        }

        const tagsWrapperClass = project.tagsLayout === 'two-line' ? 'tags-wrapper two-line' : 'tags-wrapper';

        const html =
          '<a href="' + projectLink + '" class="featured-project-link">' +
            '<div class="featured-project ' + isLast + '">' +
              '<div class="media-container" style="width: 100%;">' + mediaContent + '</div>' +
              '<div class="project-info hoverZoom">' +
                '<h1>' + project.title + '</h1>' +
                '<div class="' + tagsWrapperClass + '">' +
                  '<h2>' + (project.medium || '') + '</h2>' +
                  tagsHTML +
                '</div>' +
              '</div>' +
            '</div>' +
          '</a>';

        featuredContainer.insertAdjacentHTML('beforeend', html);
      });

      document.querySelectorAll(".project-info").forEach(info => {
        const h1 = info.querySelector("h1");
        const tagsWrapper = info.querySelector(".tags-wrapper");

        if (h1 && tagsWrapper) {
          h1.addEventListener("mouseenter", () => {
            tagsWrapper.classList.add("hover-effect");
            h1.classList.add("hover-effect");
          });
          h1.addEventListener("mouseleave", () => {
            tagsWrapper.classList.remove("hover-effect");
            h1.classList.remove("hover-effect");
          });

          tagsWrapper.addEventListener("mouseenter", () => {
            h1.classList.add("hover-effect");
            tagsWrapper.classList.add("hover-effect");
          });
          tagsWrapper.addEventListener("mouseleave", () => {
            h1.classList.remove("hover-effect");
            tagsWrapper.classList.remove("hover-effect");
          });
        }
      });

      const mediaLayoutScript = document.createElement("script");
      mediaLayoutScript.src = "scripts/mediaLayout.js";
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
            layoutMediaPairsByHeight();
          });
        }, 100);
      };
    });
});