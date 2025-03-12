// Canvas initialization
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

ctx.imageSmoothingEnabled = false;

// Canvas resizing
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Background setup
const backgroundImage = new Image();
backgroundImage.src = 'assets/background.png';

let bgX = 0;
const scrollSpeed = 3;

// Character (Red Panda) setup
const panda = {
    x: 50,
    y: 0,
    width: 50,
    height: 50,
    dy: 0,
    gravity: 0.8,
    jumpStrength: -18,
    isOnGround: false,
    isDucking: false
};

// Ground level
const groundLevel = () => canvas.height * 0.8;

// Platform and Obstacle arrays
const platforms = [];
const obstacles = [];
let frameCount = 0;

// Platform and Obstacle spawning
function spawnPlatformsAndObstacles() {
    frameCount++;

    // Spawn platform randomly every 120 frames (~2 seconds at 60fps)
    if (frameCount % 120 === 0) {
        const platformWidth = 100 + Math.random() * 100;
        const platformHeight = 20;
        const platformY = groundLevel() - 150 - Math.random() * 100;

        platforms.push({
            x: canvas.width,
            y: platformY,
            width: platformWidth,
            height: platformHeight
        });
    }

    // Spawn obstacle randomly every 90 frames (~1.5 seconds)
    if (frameCount % 90 === 0) {
        const obstacleSize = 40 + Math.random() * 20;
        obstacles.push({
            x: canvas.width,
            y: groundLevel() - obstacleSize,
            width: obstacleSize,
            height: obstacleSize
        });
    }
}

// Update positions of platforms and obstacles
function updatePlatformsAndObstacles() {
    platforms.forEach((platform, i) => {
        platform.x -= scrollSpeed;
        if (platform.x + platform.width < 0) {
            platforms.splice(i, 1);
        }
    });

    obstacles.forEach((obstacle, i) => {
        obstacle.x -= scrollSpeed;
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(i, 1);
        }
    });
}

// Draw platforms and obstacles
function drawPlatformsAndObstacles() {
    ctx.fillStyle = '#8d5524'; // Brown for platforms
    platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });

    ctx.fillStyle = '#000000'; // Black for obstacles
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

// Panda physics and collision
function updatePanda() {
    panda.dy += panda.gravity;
    panda.y += panda.dy;

    // Ground collision
    if (panda.y + panda.height >= groundLevel()) {
        panda.y = groundLevel() - panda.height;
        panda.dy = 0;
        panda.isOnGround = true;
    } else {
        panda.isOnGround = false;
    }

    // Platform collision
    platforms.forEach(platform => {
        if (panda.x < platform.x + platform.width &&
            panda.x + panda.width > platform.x &&
            panda.y + panda.height <= platform.y + panda.dy &&
            panda.y + panda.height + panda.dy >= platform.y) {
                panda.y = platform.y - panda.height;
                panda.dy = 0;
                panda.isOnGround = true;
        }
    });
}

// Draw Panda
function drawPanda() {
    ctx.fillStyle = '#d64045';
    ctx.fillRect(panda.x, panda.y, panda.width, panda.height);
}

// Scrolling Background
function drawScrollingBackground() {
    const bgWidth = canvas.height * (backgroundImage.width / backgroundImage.height);
    const bgHeight = canvas.height;

    bgX -= scrollSpeed / 2;

    if (bgX <= -bgWidth) bgX = 0;

    ctx.drawImage(backgroundImage, bgX, 0, bgWidth, bgHeight);
    ctx.drawImage(backgroundImage, bgX + bgWidth, 0, bgWidth, bgHeight);
}

// Main Game Loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawScrollingBackground();

    spawnPlatformsAndObstacles();
    updatePlatformsAndObstacles();
    drawPlatformsAndObstacles();

    updatePanda();
    drawPanda();

    requestAnimationFrame(gameLoop);
}

// Controls
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && panda.isOnGround) {
        panda.dy = panda.jumpStrength;
    }
    if (e.code === 'ShiftLeft') {
        panda.height = 30;
        panda.isDucking = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ShiftLeft') {
        panda.height = 50;
        panda.isDucking = false;
    }
});

document.getElementById('jumpBtn').addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (panda.isOnGround) panda.dy = panda.jumpStrength;
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

// Start Game
backgroundImage.onload = function() {
    panda.y = groundLevel() - panda.height;
    gameLoop();
};
