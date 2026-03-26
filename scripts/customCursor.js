/**
 * 自定义光标管理器
 * 使用 Canvas 绘制光标，避免被屏幕裁切
 */

class CustomCursor {
    constructor(options = {}) {
        this.pointerImageUrl = options.pointerImageUrl || '../assets/icons/pointer.svg';
        this.defaultImageUrl = options.defaultImageUrl || '../assets/icons/default.svg';
        this.pointerHotspotX = options.pointerHotspotX || 15;
        this.pointerHotspotY = options.pointerHotspotY || 0;
        this.defaultHotspotX = options.defaultHotspotX || 0;
        this.defaultHotspotY = options.defaultHotspotY || 0;
        this.basePath = options.basePath || this.getBasePath();
        
        this.canvas = null;
        this.ctx = null;
        this.pointerImage = null;
        this.defaultImage = null;
        this.mouseX = -999;
        this.mouseY = -999;
        this.isPointerMode = false;
        this.scale = window.devicePixelRatio || 1;
        this.isVisible = false;
        this.imagesLoaded = 0;
        this.totalImagesNeeded = 2;
        this.animationFrameId = null;
        
        this.init();
    }

    init() {
        // 创建 Canvas
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'custom-cursor-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 999999;
            opacity: 0;
            transition: opacity 0.15s ease-out;
        `;
        document.body.appendChild(this.canvas);
        
        // 设置 Canvas 大小以适应高 DPI 屏幕
        this.resizeCanvas();
        
        this.ctx = this.canvas.getContext('2d');
        
        // 加载图像
        this.loadImages();
        
        // 隐藏默认光标
        document.body.style.cursor = 'none';
        
        // 监听鼠标移动
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mouseenter', () => this.onMouseEnter());
        document.addEventListener('mouseleave', () => this.onMouseLeave());
        
        // 监听文档焦点变化
        document.addEventListener('focus', () => this.scheduleRender(), true);
        document.addEventListener('blur', () => this.clear(), true);
        
        // 监听窗口大小变化
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth * this.scale;
        this.canvas.height = window.innerHeight * this.scale;
        this.ctx = this.canvas.getContext('2d');
        this.ctx.scale(this.scale, this.scale);
    }

    loadImages() {
        const pointerImg = new Image();
        const defaultImg = new Image();
        
        pointerImg.onload = () => {
            this.pointerImage = pointerImg;
            this.imagesLoaded++;
            this.checkImagesReady();
        };
        
        defaultImg.onload = () => {
            this.defaultImage = defaultImg;
            this.imagesLoaded++;
            this.checkImagesReady();
        };
        
        // 使用 basePath + 相对URL
        pointerImg.src = this.basePath + 'assets/icons/pointer.svg';
        defaultImg.src = this.basePath + 'assets/icons/default.svg';
    }

    checkImagesReady() {
        if (this.imagesLoaded === this.totalImagesNeeded) {
            this.isVisible = true;
            this.canvas.style.opacity = '1';
            this.scheduleRender();
        }
    }

    getBasePath() {
        const pathname = window.location.pathname;
        // 判断当前页面是否在 archive 子目录（两级深）
        if (pathname.match(/\/archive\/[^\/]+\/[^\/]+\.html$/)) {
            // 例如 /archive/altoona/altoona.html，需要上升三级
            return '../../../';
        }
        // 根目录下的页面
        return './';
    }

    onMouseMove(e) {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
        
        // 确保光标可见
        if (!this.isVisible && this.imagesLoaded === this.totalImagesNeeded) {
            this.isVisible = true;
            this.canvas.style.opacity = '1';
        }
        
        this.scheduleRender();
    }

    onMouseEnter() {
        document.body.style.cursor = 'none';
        this.scheduleRender();
    }

    onMouseLeave() {
        this.clear();
        document.body.style.cursor = 'none';
    }

    scheduleRender() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.animationFrameId = requestAnimationFrame(() => {
            this.draw();
        });
    }

    setPointerMode(isPointer) {
        this.isPointerMode = isPointer;
        this.scheduleRender();
    }

    draw() {
        // 如果光标在屏幕外，不绘制
        if (this.mouseX < -100 || this.mouseY < -100) {
            this.ctx.clearRect(0, 0, this.canvas.width / this.scale, this.canvas.height / this.scale);
            return;
        }
        
        // 清空 Canvas
        this.ctx.clearRect(0, 0, this.canvas.width / this.scale, this.canvas.height / this.scale);
        
        const image = this.isPointerMode ? this.pointerImage : this.defaultImage;
        const hotspotX = this.isPointerMode ? this.pointerHotspotX : this.defaultHotspotX;
        const hotspotY = this.isPointerMode ? this.pointerHotspotY : this.defaultHotspotY;
        
        if (image && this.isVisible) {
            // 根据热点位置绘制
            this.ctx.drawImage(
                image,
                this.mouseX - hotspotX,
                this.mouseY - hotspotY
            );
        }
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width / this.scale, this.canvas.height / this.scale);
    }

    destroy() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        if (this.canvas) {
            this.canvas.remove();
        }
        document.body.style.cursor = 'auto';
    }

    hide() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.isVisible = false;
        if (this.canvas) {
            this.canvas.style.opacity = '0';
        }
        document.body.style.cursor = 'auto';
    }

    show() {
        this.isVisible = true;
        if (this.canvas) {
            this.canvas.style.opacity = '1';
        }
        document.body.style.cursor = 'none';
    }
}

// 初始化自定义光标
let customCursor = null;

// 需要使用默认光标的元素选择器
const defaultCursorSelectors = [
    'video',
    'iframe',
    '[role="combobox"]',
    '[role="listbox"]',
    'input[type="range"]',
    '.dropdown-menu',
    '.modal',
    '.dialog'
];

document.addEventListener('DOMContentLoaded', () => {
    // 只在桌面设备上启用自定义光标
    if (!isTouchDevice()) {
        customCursor = new CustomCursor({
            pointerImageUrl: 'assets/icons/pointer.svg',
            defaultImageUrl: 'assets/icons/default.svg',
            pointerHotspotX: 15,
            pointerHotspotY: 0,
            defaultHotspotX: 0,
            defaultHotspotY: 0
        });

        // 监听所有可点击元素
        document.addEventListener('mouseenter', (e) => {
            if (isClickable(e.target)) {
                customCursor.setPointerMode(true);
            }
        }, true);

        document.addEventListener('mouseleave', (e) => {
            if (isClickable(e.target)) {
                customCursor.setPointerMode(false);
            }
        }, true);

        // 监听需要使用默认光标的元素
        document.addEventListener('mouseenter', (e) => {
            if (needsDefaultCursor(e.target)) {
                customCursor.hide();
            }
        }, true);

        document.addEventListener('mouseleave', (e) => {
            if (needsDefaultCursor(e.target)) {
                customCursor.show();
            }
        }, true);
    }
});

// 检测元素是否需要使用默认光标
function needsDefaultCursor(element) {
    return defaultCursorSelectors.some(selector => {
        return element.matches(selector) || element.closest(selector);
    });
}

// 检测是否是触摸设备
function isTouchDevice() {
    return (('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0) ||
            (navigator.msMaxTouchPoints > 0));
}

// 检测元素是否可点击
function isClickable(element) {
    const clickableSelectors = [
        'a', 'button', '[role="button"]',
        'input[type="button"]',
        'input[type="submit"]',
        'input[type="checkbox"]',
        'input[type="radio"]',
        'input[type="text"]',
        'input[type="email"]',
        'input[type="password"]',
        'textarea',
        'select',
        'label',
        '[onclick]',
        '.hamburger-menu',
        '.featured-project-link',
        '.hoverZoom',
        '.hoverZoomRight'
    ];

    return clickableSelectors.some(selector => {
        return element.matches(selector) || element.closest(selector);
    });
}
