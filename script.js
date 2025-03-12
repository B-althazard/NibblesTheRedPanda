// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Load background image
const backgroundImage = new Image();
backgroundImage.src = 'assets/background.png';

let bgX = 0;
const scrollSpeed = 3;

// Panda setup
const panda = {
    x: 50,
    y: 0,
    width: 50,
    height: 50,
    dy: 0,
    gravity: 1.2,
    isOnGround: false,
};

const groundLevel = () => canvas.height * 0.8;

// Health Candle Chart setup
let candleData = [];
const maxCandles = 20; // Maximum number of candles
let candleTimer = 0;
const candleInterval = 1000; // One candle per second

// Platforms, Obstacles, Coins
const obstacles = [];
const coins = [];
let frameCount = 0;
let gameRunning = true;

// Points for collision detection
function isColliding(a, b) {
    return (a.x < b.x + b.width && a.x + a.width > b.x &&
            a.y < b.y + b.height && a.y + a.height > b.y);
}

// Draw Candle Chart
function drawCandles() {
    const candleWidth = 10;
    const candleSpacing = 4;
    const chartX = canvas.width - (maxCandles * (candleWidth + candleSpacing)) - 20;
    const chartY = 20;

    candleData.forEach((candle, index) => {
        ctx.fillStyle = candle > 0 ? '#4caf50' : '#ff4c4c'; // Green or red candle
        const candleHeight = Math.abs(candle) * 5;

        ctx.fillRect(
            chartX + index * (candleWidth + candleSpacing),
            chartY,
            candleWidth,
            candleHeight
        );
    });
}

// Spawn obstacles and coins
function spawnObjects() {
    frameCount++;

    if (frameCount % 90 === 0) {
        obstacles.push({
            x: canvas.width,
            y: groundLevel() - 40,
            width: 40,
            height: 40,
        });
    }

    if (frameCount % 120 === 0) {
        coins.push({
            x: canvas.width,
            y: groundLevel() - 100 - Math.random() * 150,
            width: 20,
            height: 20
        });
    }
}

// Handle collisions
function checkCollisions() {
    // Obstacles collision
    obstacles.forEach((obstacle, i) => {
        if (panda.x < obstacle.x + obstacle.width &&
            panda.x + panda.width > obstacle.x &&
            panda.y < obstacle.y + obstacle.height &&
            panda.y + panda.height > obstacle.y) {
            // Collision with enemy
            addCandle(false); // red candle
            obstacles.splice(i, 1);
        }
    });

    // Coins collection
    coins.forEach((coin, i) => {
        if (panda.x < coin.x + coin.width &&
            panda.x + panda.width > coin.x &&
            panda.y < coin.y + coin.height &&
            panda.y + panda.height > coin.y) {
            score += 1;
            coins.splice(i, 1);
        }
    });
}

// Panda physics update
function updatePanda() {
    panda.dy += panda.gravity;
    panda.y += panda.dy;

    if (panda.y + panda.height >= groundLevel()) {
        panda.y = groundLevel() - panda.height;
        panda.dy = 0;
        panda.isOnGround = true;
    }
}

// Ground level calculation
function groundLevel() {
    return canvas.height * 0.8;
}

// Health candle logic
function updateCandles(deltaTime) {
    candleTimer += deltaTime;
    if (candleTimer >= candleInterval) {
        candleTimer = 0;
        if (candleData.length >= maxCandles) {
            candleData.shift();
        }
        candleData.push({ color: 'green' });
    }
}

// Lose health (red candle)
function loseHealth() {
    candleData.push({ color: 'red' });
    if (candleData.length > maxCandles) candleData.shift();
    if (candleData.filter(c => c === 'red').length >= maxCandles) {
        gameRunning = false; // Game Over condition
        alert('Game Over!'); // Simple game over alert
    }
}

// Main game loop
let lastTime = performance.now();
let gameRunning = true;
let score = 0;

function gameLoop(timestamp) {
    if (!gameRunning) return;

    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background scrolling
    bgX -= scrollSpeed / 2;
    const bgWidth = canvas.height * (backgroundImage.width / backgroundImage.height);
    ctx.drawImage(backgroundImage, bgX, 0, bgWidth, canvas.height);
    ctx.drawImage(backgroundImage, bgX + bgWidth, 0, bgWidth, canvas.height);
    if (bgX <= -bgWidth) bgX = 0;

    spawnObjects();

    // Update and draw obstacles
    obstacles.forEach(o => {
        o.x -= scrollSpeed;
        ctx.fillStyle = 'black';
        ctx.fillRect(o.x, o.y, o.width, o.height);
    });

    // Update and draw coins
    coins.forEach(c => {
        c.x -= scrollSpeed;
        ctx.fillStyle = 'yellow';
        ctx.fillRect(c.x, c.y, c.width, c.height);
    });

    checkCollisions();
    updatePanda();
    updateCandles(deltaTime);
    drawCandles();

    // Draw panda
    ctx.fillStyle = '#d64045';
    ctx.fillRect(panda.x, panda.y, panda.width, panda.height);

    // Draw Score
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText(`Coins: ${score}`, 20, 30);

    requestAnimationFrame(gameLoop);
}

// Controls
document.addEventListener('keydown', e => {
    if (e.code === 'Space' && panda.isOnGround) panda.dy = panda.jumpStrength;
});

document.getElementById('jumpBtn').addEventListener('touchstart', e => {
    e.preventDefault();
    if (panda.isOnGround) panda.dy = panda.jumpStrength;
});

// Game start
backgroundImage.onload = () => {
    panda.y = groundLevel() - panda.height;
    candleData = [];
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
};
