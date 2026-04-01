function updateNYCTime() {
    // Get current time in NYC timezone
    const nycTime = new Date().toLocaleString('en-US', { 
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    
    const timeEl = document.getElementById('nyc-time');
    if (timeEl) {
        timeEl.textContent = `nyc:${nycTime}`;
    }
}

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
        
        // 更新 NYC 时间
        updateNYCTime();
        setInterval(updateNYCTime, 1000);

        // 渲染 APP ICONS
        const appGrid = document.getElementById('app-icons-grid');
        appGrid.innerHTML = '';

        filteredProjects.forEach(project => {
            const folderName = project.filename;
            const projectLink = "archive/" + folderName + "/" + folderName + ".html";
            
            // 使用 icon 字段作为 app icon
            let iconImage = null;
            
            if (project.icon) {
                iconImage = "archive/" + folderName + "/" + project.icon;
            }

            // 获取icon标题，如果没有则使用项目标题
            const displayTitle = project.iconTitle || project.title;

            // 创建 app icon HTML
            const appIconHTML = `
                <a href="${projectLink}" class="app-icon">
                    ${iconImage ? `<img src="${iconImage}" alt="${displayTitle}" class="app-icon-image" loading="lazy">` : `<div class="app-icon-image" style="background: linear-gradient(135deg, var(--deco-color), var(--txt-color)); display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold;">${displayTitle.charAt(0)}</div>`}
                    <span class="app-icon-label">${displayTitle}</span>
                </a>
            `;
            
            appGrid.insertAdjacentHTML('beforeend', appIconHTML);
        });

        // 更新 Checkbox 选中状态（如果有的话）
        document.querySelectorAll('.category input[type="checkbox"]').forEach(input => {
            const category = input.id.trim();
            input.checked = selectedFilters.includes(category);
        });
    })
    .catch(err => console.error("Error loading projects:", err));
}

// 监听 URL 变化，实时更新内容
window.addEventListener('popstate', renderProjects);

// 初始加载
document.addEventListener('DOMContentLoaded', renderProjects);