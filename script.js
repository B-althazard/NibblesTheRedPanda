// Canvas and context setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Load Background Image
const backgroundImage = new Image();
backgroundImage.src = 'assets/background.png';

// Game variables
let bgX = 0;
const scrollSpeed = 3;
let frameCount = 0;
let score = 0;
let gameRunning = true;

// Panda setup
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

// Candles (Health system)
const candleData = [];
const maxCandles = 20;
let candleTimer = 0;
const candleInterval = 1000; // 1 second per candle

// Obstacles and Coins arrays
const obstacles = [];
const coins = [];

// Utility function: Ground Level
function groundLevel() {
    return canvas.height * 0.8;
}

// Update panda physics
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
}

// Draw Panda (placeholder rectangle)
function drawPanda() {
    ctx.fillStyle = "#d64045";
    ctx.fillRect(panda.x, panda.y, panda.width, panda.height);
}

// Spawn Obstacles & Coins
function spawnObjects() {
    frameCount++;

    // Obstacles every ~1.5 sec
    if (frameCount % 90 === 0) {
        obstacles.push({
            x: canvas.width,
            y: groundLevel() - 40,
            width: 40,
            height: 40
        });
    }

    // Coins spawn every 120 frames
    if (frameCount % 120 === 0) {
        coins.push({
            x: canvas.width,
            y: groundLevel() - 100 - Math.random() * 100,
            width: 20,
            height: 20
        });
    }
}

// Check collisions
function checkCollisions() {
    // Obstacle collision
    obstacles.forEach((obstacle, index) => {
        if (panda.x < obstacle.x + obstacle.width &&
            panda.x + panda.width > obstacle.x &&
            panda.y < obstacle.y + obstacle.height &&
            panda.y + panda.height > obstacle.y) {
            addCandle(false); // Red candle
            obstacles.splice(index, 1);
        }
    });

    // Coins collection
    coins.forEach((coin, index) => {
        if (panda.x < coin.x + coin.width &&
            panda.x + panda.width > coin.x &&
            panda.y < coin.y + coin.height &&
            panda.y + panda.height > coin.y) {
            score++;
            coins.splice(index, 1);
        }
    });
}

// Candle health logic
function addCandle(isGreen = true) {
    candleData.push(isGreen ? 'green' : 'red');
    if (candleData.length > maxCandles) candleData.shift();

    const redCandles = candleData.filter(c => c === 'red').length;
    if (redCandles >= maxCandles) {
        gameRunning = false;
        alert(`Game Over! Coins collected: ${score}`);
    }
}

// Draw Candles
function drawCandles() {
    const candleWidth = 10;
    const spacing = 4;
    const startX = canvas.width - (maxCandles * (candleWidth + candleSpacing)) - 20;
    const startY = 20;

    candleData.forEach((color, index) => {
        ctx.fillStyle = color === 'green' ? '#4caf50' : '#f44336';
        ctx.fillRect(
            startX + index * (candleWidth + candleSpacing),
            startY,
            candleWidth,
            30
        );
    });
}

// Main game loop
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

let lastTime = performance.now();

function gameLoop(currentTime) {
    if (!gameRunning) return;

    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Scroll background
    const bgWidth = canvas.height * (backgroundImage.width / backgroundImage.height);
    bgX -= scrollSpeed / 2;
    if (bgX <= -bgWidth) bgX = 0;
    ctx.drawImage(backgroundImage, bgX, 0, bgWidth, canvas.height);
    ctx.drawImage(backgroundImage, bgX + bgWidth, 0, bgWidth, canvas.height);

    updatePanda();
    drawPanda();

    spawnObjects();
    updateObjects();
    drawObjects();

    checkCollisions();

    // Candle timer
    candleTimer += deltaTime;
    if (candleTimer >= candleInterval) {
        addCandle(true); // Green candle every second survived
        candleTimer = 0;
    }

    drawCandles();

    // Display Score
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Coins: ${score}`, 20, 30);

    requestAnimationFrame(gameLoop);
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && panda.isOnGround) panda.dy = panda.jumpStrength;
});

document.getElementById('jumpBtn').addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (panda.isOnGround) panda.dy = panda.jumpStrength;
});

document.getElementById('duckBtn').addEventListener('touchstart', () => panda.height = 30);
document.getElementById('duckBtn').addEventListener('touchend', () => panda.height = 50);

// Update Obstacles and Coins
function spawnObjects() {
    frameCount++;
    if (frameCount % 90 === 0) {
        obstacles.push({ x: canvas.width, y: groundLevel() - 40, width: 40, height: 40 });
    }
    if (frameCount % 120 === 0) {
        coins.push({ x: canvas.width, y: groundLevel() - 100 - Math.random() * 50, width: 20, height: 20 });
    }
}

function updateObjects() {
    obstacles.forEach((o, i) => {
        o.x -= scrollSpeed;
        if (o.x + o.width < 0) obstacles.splice(i, 1);
    });
    coins.forEach((c, i) => {
        c.x -= scrollSpeed;
        if (c.x + c.width < 0) coins.splice(i, 1);
    });
}

function drawObjects() {
    obstacles.forEach(o => {
        ctx.fillStyle = "#222";
        ctx.fillRect(o.x, o.y, o.width, o.height);
    });
    coins.forEach((c) => {
        ctx.fillStyle = "yellow";
        ctx.fillRect(c.x, c.y, c.width, c.height);
    });
}

// Start game after background loads
backgroundImage.onload = () => {
    panda.y = groundLevel() - panda.height;
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
};
