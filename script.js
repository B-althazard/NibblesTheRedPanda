// Canvas initialization
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Ensure pixel art stays sharp
ctx.imageSmoothingEnabled = false;

// Resize canvas function
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Load Background Image
const backgroundImage = new Image();
backgroundImage.src = 'assets/background.png';

// Background scroll variables
let bgX = 0;
const scrollSpeed = 2; // Background scroll speed (pixels per frame)

// Panda object placeholder (for reference)
const panda = {
    x: 50,
    y: 0,
    width: 50,
    height: 50,
    dy: 0,
    gravity: 1.2,
    jumpStrength: -20,
    isOnGround: false,
    isDucking: false
};

// Calculate ground position
function groundLevel() {
    return canvas.height * 0.8;
}

// Update Panda physics (placeholder logic)
function updatePanda() {
    panda.dy += panda.gravity;
    panda.y += panda.dy;

    if (panda.y + panda.height >= groundLevel()) {
        panda.y = groundLevel() - panda.height;
        panda.dy = 0;
        panda.isOnGround = true;
    } else {
        panda.isOnGround = false;
    }
}

// Draw Panda (temporary rectangle as placeholder)
function drawPanda() {
    ctx.fillStyle = "#d64045"; // Red panda color
    ctx.fillRect(panda.x, panda.y, panda.width, panda.height);
}

// Infinite scrolling background logic
function drawScrollingBackground() {
    const bgWidth = canvas.height * (backgroundImage.width / backgroundImage.height);
    const bgHeight = canvas.height;

    bgX -= scrollSpeed;

    if (bgX <= -bgWidth) {
        bgX = 0;
    }

    // Draw two images side by side for seamless loop
    ctx.drawImage(backgroundImage, bgX, 0, bgWidth, bgHeight);
    ctx.drawImage(backgroundImage, bgX + bgWidth, 0, bgWidth, bgHeight);
}

// Main game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawScrollingBackground();
    updatePanda();
    drawPanda();

    requestAnimationFrame(gameLoop);
}

// Event handlers (keyboard)
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && panda.isOnGround) {
        panda.dy = panda.jumpStrength;
    }
    if (e.code === 'ShiftLeft') {
        panda.height = 30; // Ducking reduces height
        panda.isDucking = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ShiftLeft') {
        panda.height = 50; // Reset height after ducking
        panda.isDucking = false;
    }
});

// Mobile controls setup
document.getElementById('jumpBtn').addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (panda.isOnGround) {
        panda.dy = panda.jumpStrength;
    }
});

document.getElementById('duckBtn').addEventListener('touchstart', (e) => {
    e.preventDefault();
    panda.height = 30;
    panda.isDucking = true;
});

document.getElementById('duckBtn').addEventListener('touchend', (e) => {
    e.preventDefault();
    panda.height = 50;
    panda.isDucking = false;
});

// Start the game loop once background is loaded
backgroundImage.onload = function() {
    panda.y = groundLevel() - panda.height; // Initialize panda position
    gameLoop();
};
