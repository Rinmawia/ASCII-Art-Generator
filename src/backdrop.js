// Interactive ASCII Backdrop
const canvas = document.getElementById('backdropCanvas');
const ctx = canvas.getContext('2d');

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let particles = [];

const ASCII_CHARS = ' .:-=+*#%@';

class Particle {
    constructor(x, y) {
        this.baseX = x;
        this.baseY = y;
        this.x = x;
        this.y = y;
        this.char = ASCII_CHARS[Math.floor(Math.random() * ASCII_CHARS.length)];
        this.baseChar = this.char;
        this.size = 12;
        this.speedX = 0;
        this.speedY = 0;
    }

    update() {
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 200;

        if (distance < maxDistance) {
            const force = (maxDistance - distance) / maxDistance;
            const angle = Math.atan2(dy, dx);

            this.speedX -= Math.cos(angle) * force * 0.5;
            this.speedY -= Math.sin(angle) * force * 0.5;

            // Change character based on proximity
            const charIndex = Math.min(
                ASCII_CHARS.length - 1,
                Math.floor((1 - distance / maxDistance) * ASCII_CHARS.length)
            );
            this.char = ASCII_CHARS[charIndex];
        } else {
            this.char = this.baseChar;
        }

        // Apply friction
        this.speedX *= 0.85;
        this.speedY *= 0.85;

        // Move particle
        this.x += this.speedX;
        this.y += this.speedY;

        // Return to base position
        const returnForce = 0.05;
        this.x += (this.baseX - this.x) * returnForce;
        this.y += (this.baseY - this.y) * returnForce;
    }

    draw() {
        ctx.fillStyle = 'rgba(100, 108, 255, 0.8)';
        ctx.font = `${this.size}px 'JetBrains Mono', monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.char, this.x, this.y);
    }
}

function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particles = [];

    const cols = Math.floor(canvas.width / 20);
    const rows = Math.floor(canvas.height / 20);

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const px = x * 20 + 10;
            const py = y * 20 + 10;
            particles.push(new Particle(px, py));
        }
    }
}

function animate() {
    ctx.fillStyle = 'rgba(15, 15, 17, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    requestAnimationFrame(animate);
}

// Track mouse movement
window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// Handle resize
window.addEventListener('resize', () => {
    init();
});

// Initialize and start animation
init();
animate();

// Export function to hide backdrop
export function hideBackdrop() {
    canvas.classList.add('hidden');
}

export function showBackdrop() {
    canvas.classList.remove('hidden');
}
