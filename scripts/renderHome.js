document.addEventListener('DOMContentLoaded', function(){
  function escapeHTML(value) {
    const element = document.createElement('div');
    element.textContent = value == null ? '' : String(value);
    return element.innerHTML;
  }

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
                '<video src="' + project.video + '" class="media-item hoverZoom" autoplay muted loop playsinline webkit-playsinline preload="auto" disablePictureInPicture controlsList="nodownload nofullscreen noremoteplayback"></video>' +
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
                '<video src="' + project.video + '" class="' + ratioClass + ' hoverZoom" autoplay muted loop playsinline webkit-playsinline preload="auto" disablePictureInPicture controlsList="nodownload nofullscreen noremoteplayback"></video>' +
                '</div>'
              );
            } else {
              mediaItems.push(
                '<div class="media-box">' +
                '<iframe class="' + ratioClass + '" src="' + project.video + '" frameborder="0" allow="autoplay" title="' + project.title + '"></iframe>' +
                '</div>'
              );
            }
          }
        }                     

        if (project.cover) {
          const coverDimensions = Number.isFinite(project.coverWidth) && project.coverWidth > 0 &&
            Number.isFinite(project.coverHeight) && project.coverHeight > 0
            ? ' width="' + project.coverWidth + '" height="' + project.coverHeight + '"'
            : '';
          const coverHTML = '<img class="media-item hoverZoom lazy-fade" loading="lazy"' + coverDimensions + ' src="archive/' + folderName + '/' + project.cover + '" alt="' + project.title + ' - cover" onload="this.classList.add(\'loaded\')">'
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
          tagsHTML = '<h2>' + escapeHTML(project.tags[0]) + '</h2>' +
            project.tags.slice(1).map(tag =>
              '<span class="tag-secondary">' + escapeHTML(tag) + '</span>'
            ).join('');
        }

        const tagsWrapperClass = 'tags-wrapper';
        const descriptionPreview = typeof project.homeDescription === 'string'
          ? project.homeDescription.trim()
          : '';

        const html =
            '<div class="featured-project ' + isLast + '">' +
              '<a href="' + projectLink + '" class="media-container" style="width: 100%;">' + mediaContent + '</a>' +
              '<div class="project-info">' +
                '<a href="' + projectLink + '" class="project-title-link hoverZoom">' +
                '<h1>' + escapeHTML(project.title) + '</h1>' +
                '<div class="' + tagsWrapperClass + '">' +
                  tagsHTML +
                '</div>' +
                '</a>' +
                (descriptionPreview ? '<p class="project-description-preview"><a href="' + projectLink + '" class="project-description-link hoverZoom">' + escapeHTML(descriptionPreview) + '</a></p>' : '') +
              '</div>' +
            '</div>';

        featuredContainer.insertAdjacentHTML('beforeend', html);
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

      // Looping fallback for mobile browsers
      document.body.addEventListener('ended', function(e) {
        if (e.target.tagName === 'VIDEO' && e.target.hasAttribute('loop')) {
          e.target.play();
        }
      }, true); // Use capture phase because 'ended' doesn't bubble

    });
});
