function renderProjects() {
    fetch("archive/data.json")
    .then(response => response.json())
    .then(data => {
        // 根据 URL 获取选中的过滤条件
        const urlParams = new URLSearchParams(window.location.search);
        let selectedFilters = urlParams.get("filter") ? urlParams.get("filter").split(",") : [];

        // 如果filter参数为空，直接返回首页
        if (selectedFilters.length === 0 || (selectedFilters.length === 1 && selectedFilters[0].trim() === '')) {
            if (typeof navigateWithTransition === "function") {
                navigateWithTransition("index.html");
            } else {
                window.location.href = "index.html";
            }
            return;
        }

        // 过滤项目
        let filteredProjects = data.projects;
        if (!selectedFilters.includes("all")) {
            filteredProjects = data.projects.filter(project => {
                return selectedFilters.some(filter => 
                    project.categories.map(c => c.toLowerCase()).includes(filter)
                );
            });
        }

        // 更新统计信息
        const statsEl = document.getElementById('filter-stats');
        const statsText = `<span class="filter-stats-number">(${filteredProjects.length})</span> matching results for <span class="filter-stats-number">(${selectedFilters.length})</span> tags selected`;
        statsEl.innerHTML = statsText;

        // 渲染项目列表
        const projectsList = document.getElementById('filtered-projects-list');
        projectsList.innerHTML = '';

        filteredProjects.forEach((project, index) => {
            const isLast = index === filteredProjects.length - 1 ? 'is-last' : '';      
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

            // 提取前两句话作为简洁介绍
            let shortDescription = '';
            if (project.description) {
                // 移除 HTML 标签
                const plainText = project.description.replace(/<[^>]*>/g, '');
                // 根据句号分割
                const sentences = plainText.split(/[。.]/);
                // 取前两句，去除空字符
                shortDescription = sentences.slice(0, 2)
                    .map(s => s.trim())
                    .filter(s => s.length > 0)
                    .join('. ');
                if (shortDescription) {
                    if (!shortDescription.endsWith('.')) {
                        shortDescription += '.';
                    }
                    shortDescription += '..';
                }
            }

            // 生成 tags HTML
            let tagsHTML = '';
            if (project.tags && Array.isArray(project.tags) && project.tags.length > 0) {
              tagsHTML = project.tags.map(tag => 
                '<span class="tag-secondary">' + tag + '</span>'
              ).join('');
            }

            // 根据标题长度和设备类型自动设置tags的margin-top
            let tagsWrapperClass = 'tags-wrapper filter-tags';
            if (project.tagsLayout === 'two-line') {
              tagsWrapperClass += ' two-line';
            } else {
              // 根据标题长度自动判断是否需要 two-line 或 three-line
              const titleLength = project.title.length;
              if (window.innerWidth <= 768) {
                // 手机版：标题较长时使用 three-line
                if (titleLength > 20) {
                  tagsWrapperClass += ' three-line';
                } else if (titleLength > 15) {
                  tagsWrapperClass += ' two-line';
                }
              } else {
                // 电脑版：标题较长时使用 two-line
                if (titleLength > 30) {
                  tagsWrapperClass += ' two-line';
                }
              }
            }

            const html =
              '<a href="' + projectLink + '" class="featured-project-link">' +
                '<div class="featured-project ' + isLast + '">' +
                  '<div class="media-container filter-media-container">' + mediaContent + '</div>' +
                  '<div class="project-info filter-project-info hoverZoom">' +
                    '<h1>' + project.title + '</h1>' +
                    '<div class="' + tagsWrapperClass + '">' +
                      '<h2>' + (project.medium || '') + '</h2>' +
                      tagsHTML +
                    '</div>' +
                    '<h3 class="filter-description">' + shortDescription + '</h3>' +
                  '</div>' +
                '</div>' +
              '</a>';

            projectsList.insertAdjacentHTML('beforeend', html);
        });

        // 更新 Checkbox 选中状态
        document.querySelectorAll('.category input[type="checkbox"]').forEach(input => {
            const category = input.id.trim();
            input.checked = selectedFilters.includes(category);
        });

        // 加载 mediaLayout.js
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

        // Handle window resize for mobile responsiveness
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const mediaContainers = document.querySelectorAll('.media-pair');
                mediaContainers.forEach(container => {
                    const mediaBoxes = container.querySelectorAll('.media-box');
                    if (window.innerWidth <= 768) {
                        mediaBoxes.forEach((box, i) => {
                            if (i > 0) {
                                box.style.display = 'none !important';
                                box.style.visibility = 'hidden !important';
                            }
                        });
                    } else {
                        mediaBoxes.forEach((box) => {
                            box.style.display = '';
                            box.style.visibility = '';
                        });
                    }
                });
                
                if (window.innerWidth > 768) {
                    layoutMediaPairsByHeight();
                }
            }, 100);
        });
    })
    .catch(err => console.error("Error loading projects:", err));
}

// 监听 URL 变化，实时更新内容
window.addEventListener('popstate', renderProjects);

// 初始加载
document.addEventListener('DOMContentLoaded', renderProjects);