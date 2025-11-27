// Interactive ASCII Backdrop with Fractal Noise
const canvas = document.getElementById('backdropCanvas');
const ctx = canvas.getContext('2d');

let particles = [];
let time = 0;

const ASCII_CHARS = ' .:-=+*#%@';

// Simple noise function (pseudo-random based on coordinates)
function noise(x, y, z) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;

    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);

    const u = fade(x);
    const v = fade(y);
    const w = fade(z);

    // Hash coordinates
    const A = (X + Y * 57 + Z * 131) * 0.618033988749895;
    return (Math.sin(A) * 43758.5453123) % 1;
}

function fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
}

function fractalNoise(x, y, z) {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;

    // Multiple octaves for fractal effect
    for (let i = 0; i < 4; i++) {
        value += noise(x * frequency, y * frequency, z) * amplitude;
        amplitude *= 0.5;
        frequency *= 2;
    }

    return value;
}

class Particle {
    constructor(x, y, gridX, gridY) {
        this.x = x;
        this.y = y;
        this.gridX = gridX;
        this.gridY = gridY;
        this.size = 12;
    }

    update(time) {
        // Create smooth scrolling offset based on time
        const offsetX = time * 0.02; // Horizontal scroll speed
        const offsetY = time * 0.015; // Vertical scroll speed (slightly different for diagonal flow)

        // Sample noise at this particle's position + the scrolling offset
        const noiseValue = fractalNoise(
            (this.gridX + offsetX) * 0.1,
            (this.gridY + offsetY) * 0.1,
            0 // No time dimension needed since we're scrolling the space
        );

        // Map noise value to character index
        const charIndex = Math.floor(noiseValue * ASCII_CHARS.length);
        this.char = ASCII_CHARS[Math.min(charIndex, ASCII_CHARS.length - 1)];

        // Keep particles in their fixed positions (no jitter)
        this.displayX = this.x;
        this.displayY = this.y;
    }

    draw() {
        ctx.fillStyle = 'rgba(161, 161, 170, 0.5)';
        ctx.font = `${this.size}px 'JetBrains Mono', monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.char, this.displayX, this.displayY);
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
            particles.push(new Particle(px, py, x, y));
        }
    }
}

function animate() {
    ctx.fillStyle = 'rgba(15, 15, 17, 0.15)'; // Lighter fade for smoother trails
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    time++;

    particles.forEach(particle => {
        particle.update(time);
        particle.draw();
    });

    requestAnimationFrame(animate);
}

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
