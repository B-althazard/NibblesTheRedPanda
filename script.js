// Canvas setup (single declaration)
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

// Game state
let frameCount = 0;
let score = 0;
let gameRunning = true;

// Panda setup (declared once)
const panda = {
    x: 50,
    y: 0,
    width: 50,
    height: 50,
    dy: 0,
    gravity: 1.2,
    jumpStrength: -20,
    isOnGround: false,
};

// Health Candle Chart
const candles = [];
const maxCandles = 20;
let candleTimer = 0;
const candleInterval = 1000;

// Obstacles & Coins
const obstacles = [];
const coins = [];

// Resize Canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Ground Level
const groundLevel = () => canvas.height * 0.8;

// Game Loop
let lastTimestamp = performance.now();

function gameLoop(timestamp) {
    if (!gameRunning) return;

    const deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateBackground();
    updatePanda();
    spawnObjects();
    updateObjects();
    checkCollisions();
    updateCandles(deltaTime);

    drawBackground();
    drawObjects();
    drawPanda();
    drawCandles();
    drawScore();

    requestAnimationFrame(gameLoop);
}

// Background update & draw
function updateBackground() {
    const bgWidth = canvas.height * (backgroundImage.width / backgroundImage.height);
    bgX -= scrollSpeed / 2;
    if (bgX <= -bgWidth) bgX = 0;
}

function drawBackground() {
    const bgWidth = canvas.height * (backgroundImage.width / backgroundImage.height);
    ctx.drawImage(backgroundImage, bgX, 0, bgWidth, canvas.height);
    ctx.drawImage(backgroundImage, bgX + bgWidth, 0, bgWidth, canvas.height);
}

// Panda update & draw
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

function drawPanda() {
    ctx.fillStyle = '#d64045';
    ctx.fillRect(panda.x, panda.y, panda.width, panda.height);
}

// Spawn objects (obstacles & coins)
function spawnObjects() {
    frameCount++;
    if (frameCount % 90 === 0) {
        obstacles.push({ x: canvas.width, y: groundLevel() - 40, width: 40, height: 40 });
    }
    if (frameCount % 120 === 0) {
        coins.push({ x: canvas.width, y: groundLevel() - 150 - Math.random() * 100, width: 20, height: 20 });
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
    ctx.fillStyle = 'black';
    obstacles.forEach(o => ctx.fillRect(o.x, o.y, o.width, o.height));

    ctx.fillStyle = 'yellow';
    coins.forEach(c => ctx.fillRect(c.x, c.y, c.width, c.height));
}

// Collision detection
function checkCollisions() {
    obstacles.forEach((o, i) => {
        if (panda.x < o.x + o.width && panda.x + panda.width > o.x &&
            panda.y < o.y + o.height && panda.y + panda.height > o.y) {
            addCandle(false);
            obstacles.splice(i, 1);
        }
    });

    coins.forEach((c, i) => {
        if (panda.x < c.x + c.width && panda.x + panda.width > c.x &&
            panda.y < c.y + c.height && panda.y + panda.height > c.y) {
            score++;
            coins.splice(i, 1);
        }
    });
}

// Health Candle logic
function updateCandles(deltaTime) {
    candleTimer += deltaTime;
    if (candleTimer >= candleInterval) {
        addCandle(true);
        candleTimer -= candleInterval;
    }
}

function addCandle(isGreen) {
    candles.push(isGreen ? 'green' : 'red');
    if (candles.length > maxCandles) candles.shift();

    if (candles.filter(c => c === 'red').length >= maxCandles) {
        gameRunning = false;
        alert(`Game Over! Coins collected: ${score}`);
    }
}

function drawCandles() {
    const candleWidth = 10, spacing = 4;
    const x = canvas.width - (maxCandles * (candleWidth + spacing)) - 20;
    const y = 20;

    candles.forEach((color, i) => {
        ctx.fillStyle = color === 'green' ? '#4caf50' : '#f44336';
        ctx.fillRect(x + i * (candleWidth + candleSpacing), y, candleWidth, 30);
    });
}

// Score Display
function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Coins: ${score}`, 20, 30);
}

// Controls
document.addEventListener('keydown', e => {
    if (e.code === 'Space' && panda.isOnGround) panda.dy = panda.jumpStrength;
});

document.getElementById('jumpBtn').addEventListener('touchstart', e => {
    e.preventDefault();
    if (panda.isOnGround) panda.dy = panda.jumpStrength;
});

// Start the game after loading background
backgroundImage.onload = function() {
    panda.y = groundLevel() - panda.height;
    requestAnimationFrame(gameLoop);
};
