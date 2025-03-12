// Get canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Pixel art settings
ctx.imageSmoothingEnabled = false;

// Resize canvas to full screen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Initialize game objects
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

// Placeholder ground height
const groundHeight = canvas.height - 100;

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.fillStyle = "#6a994e";
    ctx.fillRect(0, groundLevel(), canvas.width, canvas.height - groundLevel());

    // Draw red panda (placeholder rectangle)
    ctx.fillStyle = "#c44536"; // Panda color
    ctx.fillRect(panda.x, panda.y, panda.width, panda.height);

    updatePanda();
    requestAnimationFrame(gameLoop);
}

// Game loop function
function gameLoop() {
    update();
    requestAnimationFrame(gameLoop);
}

// Define ground level based on canvas size
function groundLevel() {
    return canvas.height * 0.8;
}

// Update panda position (basic gravity implementation)
function update() {
    if (panda.y + panda.height < groundLevel()) {
        panda.y += 5; // gravity
    } else {
        panda.y = groundLevel() - panda.height; // stay on ground
    }

    draw();
    requestAnimationFrame(update);
}

// Jump function
function jump() {
    if (panda.y + panda.height >= groundLevel()) {
        panda.dy = -20; // jump strength
    }
}

// Duck function (placeholder)
function duck(isDucking) {
    if (isDucking) {
        panda.height = 25;
    } else {
        panda.height = 50;
    }
}

// Event listeners for desktop
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') jump();
    if (e.code === 'ShiftLeft') duck(true);
});
document.addEventListener('keyup', (e) => {
    if (e.code === 'ShiftLeft') duck(false);
});

// Mobile Controls
const duckBtn = document.getElementById('duckBtn');
const jumpBtn = document.getElementById('jumpBtn');

duckBtn.addEventListener('touchstart', () => duck(true));
duckBtn.addEventListener('touchend', () => duck(false));
jumpBtn.addEventListener('touchstart', jump);

// Start game loop
setInterval(update, 1000 / 60); // 60 FPS