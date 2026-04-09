document.addEventListener('DOMContentLoaded', function(){
  fetch("assets/json/data.json")
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
          // Check if video is MP4 or iframe-based
          const isMP4 = project.video.toLowerCase().endsWith('.mp4');
          
          if (isPureVideo) {
            // 单独视频结构，iframe 不带比例类（绝对不要加比例类）
            let wrapperClass = "video-wrapper";
            if (project.videoRatio === "1-1") wrapperClass += " square";
            else if (project.videoRatio === "4-3") wrapperClass += " fourthree";
            else if (project.videoRatio === "16-9") wrapperClass += " ratio-16-9";
        
            if (isMP4) {
              mediaItems.push(
                '<div class="' + wrapperClass + '">' +
                '<video class="media-item hoverZoom" autoplay muted loop playsinline webkit-playsinline><source src="' + project.video + '" type="video/mp4"></video>' +
                '</div>'
              );
            } else {
              mediaItems.push(
                '<div class="' + wrapperClass + '">' +
                '<iframe src="' + project.video + '" frameborder="0" allow="autoplay" title="' + project.title + '"></iframe>' +
                '</div>'
              );
            }
          } else {
            // 两个媒体项目或有cover时需要比例类
            if (isMP4) {
              mediaItems.push(
                '<div class="media-box">' +
                '<video class="' + ratioClass + ' hoverZoom" autoplay muted loop playsinline webkit-playsinline><source src="' + project.video + '" type="video/mp4"></video>' +
                '</div>'
              );
            } else {
              mediaItems.push(
                '<div class="media-box">' +
                '<iframe class="' + ratioClass + '" src="' + project.video + '" frameborder="0" allow="autoplay; fullscreen" allowfullscreen title="' + project.title + '"></iframe>' +
                '</div>'
              );
            }
          }
        }                     

        if (project.cover) {
          const coverHTML = '<img class="media-item hoverZoom lazy-fade" loading="lazy" src="archive/' + folderName + '/' + project.cover + '" alt="' + project.title + ' - cover" onload="this.classList.add(\'loaded\')">'
          mediaItems.push('<div class="media-box hoverZoom">' + coverHTML + '</div>');
        }

        // Only load cover2 on desktop/tablet (> 768px width)
        if (project.cover2 && window.innerWidth > 768) {
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

        const tagsWrapperClass = 'tags-wrapper';

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

      // 根据实际渲染的h1高度来动态调整tags的margin-top
      setTimeout(() => {
        document.querySelectorAll('.featured-project').forEach(project => {
          const h1 = project.querySelector('h1');
          const tagsWrapper = project.querySelector('.tags-wrapper');
          
          if (h1 && tagsWrapper) {
            const h1Height = h1.offsetHeight;
            
            // 移除之前的 line classes
            tagsWrapper.classList.remove('two-line', 'three-line');
            
            // 根据 h1 的实际高度判断需要的 margin-top
            if (window.innerWidth <= 768) {
              // 手机版：每行约 24px 左右
              if (h1Height > 50) {
                tagsWrapper.classList.add('three-line');
              } else if (h1Height > 30) {
                tagsWrapper.classList.add('two-line');
              }
            } else {
              // 电脑版：每行约 26px 左右
              if (h1Height > 40) {
                tagsWrapper.classList.add('two-line');
              }
            }
          }
        });
      }, 100);

      // Handle window resize/orientation change for mobile responsiveness
      let resizeTimeout;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          const mediaContainers = document.querySelectorAll('.media-pair');
          mediaContainers.forEach(container => {
            const mediaBoxes = container.querySelectorAll('.media-box');
            if (window.innerWidth <= 768) {
              // Mobile: hide all but first
              mediaBoxes.forEach((box, i) => {
                if (i > 0) {
                  box.style.display = 'none !important';
                  box.style.visibility = 'hidden !important';
                }
              });
            } else {
              // Desktop: show all
              mediaBoxes.forEach((box) => {
                box.style.display = '';
                box.style.visibility = '';
              });
            }
          });
          
          if (window.innerWidth > 768) {
            layoutMediaPairsByHeight();
          }

          // 重新调整 tags 的 margin-top
          document.querySelectorAll('.featured-project').forEach(project => {
            const h1 = project.querySelector('h1');
            const tagsWrapper = project.querySelector('.tags-wrapper');
            
            if (h1 && tagsWrapper) {
              const h1Height = h1.offsetHeight;
              
              // 移除之前的 line classes
              tagsWrapper.classList.remove('two-line', 'three-line');
              
              // 根据 h1 的实际高度判断需要的 margin-top
              if (window.innerWidth <= 768) {
                // 手机版：每行约 24px 左右
                if (h1Height > 50) {
                  tagsWrapper.classList.add('three-line');
                } else if (h1Height > 30) {
                  tagsWrapper.classList.add('two-line');
                }
              } else {
                // 电脑版：每行约 26px 左右
                if (h1Height > 40) {
                  tagsWrapper.classList.add('two-line');
                }
              }
            }
          });
        }, 100);
      });
    });
});