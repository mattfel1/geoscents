function goldConfetti() {
    const colors = ['#FFD700', '#FFA500', '#FF4500', '#FF69B4', '#00CED1', '#7B68EE', '#32CD32'];
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9998;';
    document.body.appendChild(canvas);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    const particles = Array.from({
        length: 200
    }, () => ({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * canvas.height * 0.3,
        w: Math.random() * 12 + 5,
        h: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: Math.random() * 4 - 2,
        vy: Math.random() * 3 + 2,
        rot: Math.random() * 360,
        vrot: Math.random() * 6 - 3,
    }));
    const start = Date.now();
    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.rot += p.vrot;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot * Math.PI / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();
        });
        if (Date.now() - start < 5000) requestAnimationFrame(animate);
        else canvas.remove();
    };
    requestAnimationFrame(animate);
}

function emojiRain(emoji, count = 40) {
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const el = document.createElement('span');
            el.textContent = emoji;
            el.style.cssText = `position:fixed;top:-60px;left:${Math.random() * 95}vw;font-size:${22 + Math.random() * 18}px;z-index:9998;pointer-events:none;animation:emojifall ${1.5 + Math.random() * 2}s linear forwards;`;
            document.body.appendChild(el);
            el.addEventListener('animationend', () => el.remove());
        }, i * (3000 / count));
    }
}

module.exports = {
    goldConfetti,
    emojiRain
};