function renderProjects() {
    fetch(basePath + "../archive/data.json")
    .then(response => response.json())
    .then(data => {
        const projectContainer = document.getElementById('filtered-projects');
        projectContainer.innerHTML = ''; // 清空旧内容

        data.projects.forEach(project => {
            const folderName = project.filename;
            const projectLink = `archive/${folderName}/${folderName}.html`;
            const projectCover = `archive/${folderName}/cover.jpg`;            

            // 项目拥有的分类
            const projectClasses = project.categories.map(c => c.toLowerCase()).join(" ");

            // 默认添加 hidden 类
            const projectBlock = `
                <div class="hoverZoomRight work ${projectClasses} hidden">
                    <a href="${projectLink}">
                        <img src="${projectCover}" alt="${project.title}">
                    </a>
                </div>
            `;

            projectContainer.innerHTML += projectBlock;
        });

        // 根据 URL 设置默认筛选项
        applyFiltersFromURL();
    })
    .catch(err => console.error("Error loading projects:", err));
}

// 解析 URL，激活对应分类
function applyFiltersFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    let selectedFilters = urlParams.get("filter") ? urlParams.get("filter").split(",") : [];

    // 如果filter参数为空字符串 ""，也视为无效情况直接返回首页
    if (selectedFilters.length === 0 || (selectedFilters.length === 1 && selectedFilters[0].trim() === '')) {
        window.location.href = "index.html";
        return;
    }

    // 如果选中 "all"，显示所有作品
    if (selectedFilters.includes("all")) {
        document.querySelectorAll('.work').forEach(work => work.classList.remove('hidden'));
    } else {
        document.querySelectorAll('.work').forEach(work => work.classList.add('hidden'));
        selectedFilters.forEach(filter => {
            document.querySelectorAll(`.${filter}`).forEach(work => work.classList.remove('hidden'));
        });
    }

    // 更新 Checkbox 选中状态
    document.querySelectorAll('.category input[type="checkbox"]').forEach(input => {
        const category = input.id.replace('c', '').trim();
        input.checked = selectedFilters.includes(category);
    });

    // 如果没有匹配的作品显示，也返回首页
    const visibleProjects = document.querySelectorAll('.work:not(.hidden)');
    if (visibleProjects.length === 0) {
        window.location.href = "index.html";
    }
}

// 🚀 监听 URL 变化，实时更新内容
window.addEventListener('popstate', applyFiltersFromURL);

// 🚀 初始加载
document.addEventListener('DOMContentLoaded', renderProjects);