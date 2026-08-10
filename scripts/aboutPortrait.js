document.addEventListener('DOMContentLoaded', () => {
    const portraitStack = document.getElementById('portrait-stack');
    const portraitImg = document.getElementById('portrait-image');

    if (!portraitStack || !portraitImg) return;

    const images = [
        'assets/images/portrait.jpg',
        'assets/images/2.jpg',
        'assets/images/3.jpg',
        'assets/images/4.jpg',
        'assets/images/5.jpg',
        'assets/images/6.jpg'
    ];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    let intervalId = null;
    let currentIndex = 0;

    images.slice(1).forEach((src) => {
        const image = new Image();
        image.src = src;
    });

    const showNextPhoto = () => {
        currentIndex = (currentIndex + 1) % images.length;
        portraitImg.src = images[currentIndex];
    };

    const startCycling = () => {
        if (reduceMotion || intervalId) return;
        intervalId = window.setInterval(showNextPhoto, 400);
    };

    const stopCycling = () => {
        if (intervalId) window.clearInterval(intervalId);
        intervalId = null;
        currentIndex = 0;
        portraitImg.src = images[0];
    };

    portraitStack.addEventListener('pointerenter', (event) => {
        if (event.pointerType === 'mouse') startCycling();
    });
    portraitStack.addEventListener('pointerleave', stopCycling);
    portraitStack.addEventListener('focus', startCycling);
    portraitStack.addEventListener('blur', stopCycling);
    portraitStack.addEventListener('click', () => {
        if (!finePointer || reduceMotion) showNextPhoto();
    });

    if (!finePointer || reduceMotion) return;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const particles = [];
    const borderColor = getComputedStyle(document.body).color;
    const colors = ['#2f80ff', '#ffe923', '#ff6fb5', '#acff1d', '#ff9d14', '#bd94ff', '#ffffff'];
    let animationFrameId = null;
    let lastSpawnX = 0;
    let lastSpawnY = 0;
    let pointerX = 0; 
    let pointerY = 0;
    let lastContinuousSpawnAt = 0;
    let isSprinkling = false;

    canvas.className = 'portrait-confetti-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = `
        position: fixed;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 999998;
    `;
    document.body.appendChild(canvas);

    const resizeCanvas = () => {
        const scale = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * scale;
        canvas.height = window.innerHeight * scale;
        context.setTransform(scale, 0, 0, scale, 0, 0);
    };

    const addSprinkle = (x, y, amount = 3) => {
        for (let i = 0; i < amount; i += 1) {
            const size = 6 + Math.random() * 7;
            particles.push({
                x: x + (Math.random() - 0.5) * 26,
                y: y + (Math.random() - 0.5) * 12,
                vx: (Math.random() - 0.5) * 3.6,
                vy: -1.8 - Math.random() * 2.8,
                gravity: 0.065 + Math.random() * 0.04,
                drag: 0.985,
                size,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * Math.PI,
                spin: (Math.random() - 0.5) * 0.18,
                life: 1,
                decay: 0.008 + Math.random() * 0.006,
                shape: Math.floor(Math.random() * 3)
            });
        }

        if (particles.length > 160) particles.splice(0, particles.length - 160);
    };

    const drawParticle = (particle) => {
        context.save();
        context.globalAlpha = Math.max(0, particle.life);
        context.fillStyle = particle.color;
        context.strokeStyle = borderColor;
        context.lineWidth = 1;
        context.translate(particle.x, particle.y);
        context.rotate(particle.rotation);

        if (particle.shape === 0) {
            context.fillRect(-particle.size / 2, -particle.size / 4, particle.size, particle.size / 2);
            context.strokeRect(-particle.size / 2, -particle.size / 4, particle.size, particle.size / 2);
        } else if (particle.shape === 1) {
            context.beginPath();
            context.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
            context.fill();
            context.stroke();
        } else {
            context.beginPath();
            context.moveTo(0, -particle.size / 1.4);
            context.lineTo(particle.size / 4, -particle.size / 4);
            context.lineTo(particle.size / 1.4, 0);
            context.lineTo(particle.size / 4, particle.size / 4);
            context.lineTo(0, particle.size / 1.4);
            context.lineTo(-particle.size / 4, particle.size / 4);
            context.lineTo(-particle.size / 1.4, 0);
            context.lineTo(-particle.size / 4, -particle.size / 4);
            context.closePath();
            context.fill();
            context.stroke();
        }

        context.restore();
    };

    const animate = (timestamp) => {
        context.clearRect(0, 0, window.innerWidth, window.innerHeight);

        if (isSprinkling && timestamp - lastContinuousSpawnAt >= 100) {
            addSprinkle(pointerX, pointerY, 2 + Math.floor(Math.random() * 2));
            lastContinuousSpawnAt = timestamp;
        }

        for (let i = particles.length - 1; i >= 0; i -= 1) {
            const particle = particles[i];
            particle.vx *= particle.drag;
            particle.vy += particle.gravity;
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.rotation += particle.spin;
            particle.life -= particle.decay;
            drawParticle(particle);

            if (particle.life <= 0 || particle.y > window.innerHeight + 20) {
                particles.splice(i, 1);
            }
        }

        if (particles.length || isSprinkling) {
            animationFrameId = window.requestAnimationFrame(animate);
        } else {
            animationFrameId = null;
        }
    };

    portraitStack.addEventListener('pointerenter', (event) => {
        if (event.pointerType !== 'mouse') return;
        isSprinkling = true;
        pointerX = event.clientX;
        pointerY = event.clientY;
        lastSpawnX = event.clientX;
        lastSpawnY = event.clientY;
        lastContinuousSpawnAt = performance.now();
        addSprinkle(event.clientX, event.clientY, 6);
        if (!animationFrameId) animationFrameId = window.requestAnimationFrame(animate);
    });

    portraitStack.addEventListener('pointermove', (event) => {
        if (event.pointerType !== 'mouse') return;
        pointerX = event.clientX;
        pointerY = event.clientY;
        const distance = Math.hypot(event.clientX - lastSpawnX, event.clientY - lastSpawnY);
        if (distance < 10) return;

        lastSpawnX = event.clientX;
        lastSpawnY = event.clientY;
        addSprinkle(event.clientX, event.clientY, 3);
    });

    portraitStack.addEventListener('pointerleave', () => {
        isSprinkling = false;
    });
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
});
