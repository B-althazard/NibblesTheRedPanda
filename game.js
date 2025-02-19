const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set Canvas Size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Load assets
const playerImg = new Image();
playerImg.src = "assets/player.png";
const enemyImg = new Image();
enemyImg.src = "assets/enemy.png";
const platformImg = new Image();
platformImg.src = "assets/platform.png";
const jumpSound = new Audio("assets/jump.wav");
const hitSound = new Audio("assets/hit.wav");

// Game Variables
let gravity = 1;
let platforms = [];
let enemies = [];
let score = 0;
let gameOver = false;

// Player Object
const player = {
    x: 100,
    y: canvas.height - 150,
    width: 50,
    height: 50,
    dx: 0,
    dy: 0,
    speed: 5,
    jumpPower: -15,
    onGround: false
};

// Controls
const keys = {};
window.addEventListener("keydown", (e) => keys[e.code] = true);
window.addEventListener("keyup", (e) => keys[e.code] = false);

// Platform Generator
function createPlatform(x, y) {
    platforms.push({ x, y, width: 150, height: 20 });
}

// Enemy Generator
function createEnemy(x, y) {
    enemies.push({ x, y, width: 40, height: 40, dx: -2 });
}

// Initial Platforms
for (let i = 0; i < 5; i++) {
    createPlatform(i * 200, canvas.height - 100);
}

// Game Loop
function update() {
    if (gameOver) return;

    // Apply gravity
    player.dy += gravity;
    
    // Player movement
    if (keys["ArrowRight"]) player.dx = player.speed;
    else if (keys["ArrowLeft"]) player.dx = -player.speed;
    else player.dx = 0;

    // Jumping
    if (keys["Space"] && player.onGround) {
        player.dy = player.jumpPower;
        player.onGround = false;
        jumpSound.play();
    }

    // Apply velocity
    player.x += player.dx;
    player.y += player.dy;

    // Keep player on screen
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    // Platform Collision
    player.onGround = false;
    platforms.forEach((p) => {
        if (player.y + player.height > p.y &&
            player.y + player.height - player.dy < p.y &&
            player.x + player.width > p.x &&
            player.x < p.x + p.width) {
            player.y = p.y - player.height;
            player.dy = 0;
            player.onGround = true;
        }
    });

    // Enemy Collision
    enemies.forEach((e, index) => {
        e.x += e.dx;
        if (player.x < e.x + e.width && player.x + player.width > e.x &&
            player.y < e.y + e.height && player.y + player.height > e.y) {
            hitSound.play();
            gameOver = true;
        }

        if (e.x + e.width < 0) enemies.splice(index, 1);
    });

    // Move Platforms & Generate New Ones
    platforms.forEach((p, index) => {
        p.x -= 2;
        if (p.x + p.width < 0) {
            platforms.splice(index, 1);
            createPlatform(canvas.width, Math.random() * (canvas.height - 200) + 100);
            if (Math.random() < 0.3) createEnemy(canvas.width, canvas.height - 140);
        }
    });

    // Scoring
    score++;

    // Render
    draw();
    requestAnimationFrame(update);
}

// Render Game
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw player
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
    
    // Draw platforms
    platforms.forEach((p) => {
        ctx.drawImage(platformImg, p.x, p.y, p.width, p.height);
    });

    // Draw enemies
    enemies.forEach((e) => {
        ctx.drawImage(enemyImg, e.x, e.y, e.width, e.height);
    });

    // Draw score
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 20, 40);
}

// Start Game
update();