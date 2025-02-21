const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions for responsiveness
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gameSpeed = 5;
let score = 0;
let gameOver = false;
let scoreboardShown = false; // flag to ensure the overlay shows once

// Timers and intervals (in milliseconds)
let obstacleTimer = 0;
let obstacleInterval = 1500;

let platformTimer = 0;
let platformInterval = 3000;

let coinTimer = 0;
let coinInterval = 2000;

let lastTime = 0;

let obstacles = [];
let platforms = [];
let coins = [];

// Player object with double jump support (jumpCount)
const player = {
  x: 50,
  y: canvas.height - 100, // starting near the bottom
  width: 50,
  height: 50,
  dy: 0, // vertical velocity
  gravity: 0.8,
  jumpStrength: -15,
  jumpCount: 0, // allows for double jump
  isJumping: false
};

// Get scoreboard overlay elements from the DOM
const overlay = document.getElementById('scoreboardOverlay');
const finalScoreElement = document.getElementById('finalScore');
const playerNameInput = document.getElementById('playerName');
const submitScoreButton = document.getElementById('submitScore');

// Keyboard input (desktop)
document.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    if (gameOver) {
      // Wait for score submission
    } else if (player.jumpCount < 2) {
      player.dy = player.jumpStrength;
      player.isJumping = true;
      player.jumpCount++;
    }
  }
});

// Touch input (mobile)
canvas.addEventListener('touchstart', e => {
  if (gameOver) {
    // Wait for score submission
  } else if (player.jumpCount < 2) {
    player.dy = player.jumpStrength;
    player.isJumping = true;
    player.jumpCount++;
  }
});

// Reset game state on restart
function resetGame() {
  score = 0;
  gameOver = false;
  scoreboardShown = false;
  obstacles = [];
  platforms = [];
  coins = [];
  player.y = canvas.height - 100;
  player.dy = 0;
  player.jumpCount = 0;
  player.isJumping = false;
  obstacleTimer = 0;
  platformTimer = 0;
  coinTimer = 0;
  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
}

// AABB collision detection for obstacles
function isColliding(rect1, rect2) {
  return rect1.x < rect2.x + rect2.width &&
         rect1.x + rect1.width > rect2.x &&
         rect1.y < rect2.y + rect2.height &&
         rect1.y + rect1.height > rect2.y;
}

// Collision detection for coins (using their bounding circle)
function isCollidingCoin(player, coin) {
  return player.x < coin.x + coin.radius &&
         player.x + player.width > coin.x - coin.radius &&
         player.y < coin.y + coin.radius &&
         player.y + player.height > coin.y - coin.radius;
}

// Obstacle constructor function with optional jumping behavior
function Obstacle() {
  this.width = 20 + Math.random() * 30;  // width between 20 and 50
  this.height = 30 + Math.random() * 30;  // height between 30 and 60
  this.x = canvas.width;
  this.baseY = canvas.height - 50 - this.height; // ground level obstacle
  this.y = this.baseY;
  this.speed = gameSpeed;
  // 30% chance the obstacle will jump
  this.jumping = Math.random() < 0.3;
  if (this.jumping) {
    this.jumpAmplitude = 20 + Math.random() * 10; // amplitude between 20 and 30
    this.jumpSpeed = 0.005 + Math.random() * 0.005; // speed factor
    this.phase = 0;
  }
}

// Platform constructor function (the player can land on these)
function Platform() {
  this.width = 100 + Math.random() * 100; // width between 100 and 200
  this.height = 10;
  // y-position between 40% and 60% of canvas height (above the ground)
  this.y = canvas.height - 200 - Math.random() * 150;
  this.x = canvas.width;
  this.speed = gameSpeed;
}

// Coin constructor function (collect for extra points)
function Coin() {
  this.radius = 10;
  this.x = canvas.width;
  // y-position between 250px above the bottom and just above ground
  this.y = canvas.height - 250 + Math.random() * 150;
  this.speed = gameSpeed;
}

// Leaderboard functions using localStorage (storing array of objects {name, score})
function getLeaderboard() {
  let leaderboard = localStorage.getItem('leaderboard');
  return leaderboard ? JSON.parse(leaderboard) : [];
}

function updateLeaderboard(newEntry) {
  let leaderboard = getLeaderboard();
  leaderboard.push(newEntry);
  leaderboard.sort((a, b) => b.score - a.score); // sort descending by score
  leaderboard = leaderboard.slice(0, 5); // keep top 5 scores
  localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}

// Show scoreboard overlay for name input
function showScoreboardOverlay() {
  finalScoreElement.textContent = Math.floor(score);
  overlay.style.display = 'flex';
}

// Handle score submission from overlay
submitScoreButton.addEventListener('click', () => {
  let name = playerNameInput.value.trim();
  if (name === '') {
    name = 'Anonymous';
  }
  // Enforce maximum of 16 characters (input already has maxlength, but double-check)
  name = name.substring(0, 16);
  const newEntry = { name: name, score: Math.floor(score) };
  updateLeaderboard(newEntry);
  overlay.style.display = 'none';
  playerNameInput.value = '';
  resetGame();
});

// Main game loop using timestamp for deltaTime
function gameLoop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  let deltaTime = timestamp - lastTime;
  lastTime = timestamp;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Update player's position and apply gravity
  player.y += player.dy;
  player.dy += player.gravity;
  
  // Ground collision
  if (player.y + player.height >= canvas.height - 50) {
    player.y = canvas.height - 50 - player.height;
    player.dy = 0;
    player.jumpCount = 0;
    player.isJumping = false;
  }
  
  // Update and draw platforms
  platformTimer += deltaTime;
  if (platformTimer > platformInterval) {
    platforms.push(new Platform());
    platformTimer = 0;
    platformInterval = 2500 + Math.random() * 1500;
  }
  ctx.fillStyle = '#964B00'; // brown platforms
  for (let i = platforms.length - 1; i >= 0; i--) {
    let plat = platforms[i];
    plat.x -= plat.speed;
    ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
    // Remove off-screen platforms
    if (plat.x + plat.width < 0) {
      platforms.splice(i, 1);
    }
    // Platform landing detection (only when falling)
    if (player.dy >= 0 &&
        player.x + player.width > plat.x &&
        player.x < plat.x + plat.width &&
        player.y + player.height >= plat.y &&
        player.y + player.height <= plat.y + 10) {
      player.y = plat.y - player.height;
      player.dy = 0;
      player.jumpCount = 0;
      player.isJumping = false;
    }
  }
  
  // Update obstacle timer and spawn new obstacles
  obstacleTimer += deltaTime;
  if (obstacleTimer > obstacleInterval) {
    obstacles.push(new Obstacle());
    obstacleTimer = 0;
    obstacleInterval = 1000 + Math.random() * 1000;
  }
  
  // Update and draw obstacles; check for collisions
  for (let i = obstacles.length - 1; i >= 0; i--) {
    let obs = obstacles[i];
    obs.x -= obs.speed;
    // If obstacle is jumping, update its vertical position with a sine wave
    if (obs.jumping) {
      obs.phase += deltaTime * obs.jumpSpeed;
      obs.y = obs.baseY - Math.sin(obs.phase) * obs.jumpAmplitude;
    }
    ctx.fillStyle = '#228B22'; // green obstacles
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    
    if (isColliding(player, obs)) {
      gameOver = true;
    }
    
    // Remove obstacles that have moved off-screen
    if (obs.x + obs.width < 0) {
      obstacles.splice(i, 1);
    }
  }
  
  // Update coin timer and spawn new coins
  coinTimer += deltaTime;
  if (coinTimer > coinInterval) {
    coins.push(new Coin());
    coinTimer = 0;
    coinInterval = 1500 + Math.random() * 1000;
  }
  
  // Update and draw coins; check for collection
  ctx.fillStyle = '#FFD700'; // gold coins
  for (let i = coins.length - 1; i >= 0; i--) {
    let coin = coins[i];
    coin.x -= coin.speed;
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
    ctx.fill();
    
    if (isCollidingCoin(player, coin)) {
      score += 10; // extra points for coin collection
      coins.splice(i, 1);
      continue;
    }
    
    if (coin.x + coin.radius < 0) {
      coins.splice(i, 1);
    }
  }
  
  // Update score based on time elapsed
  score += deltaTime * 0.01;
  ctx.fillStyle = '#000';
  ctx.font = '20px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('Score: ' + Math.floor(score), 10, 30);
  
  // Draw the ground
  ctx.fillStyle = '#888';
  ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
  
  // Draw the player
  ctx.fillStyle = '#333';
  ctx.fillRect(player.x, player.y, player.width, player.height);
  
  // Check for game over to display scoreboard overlay
  if (gameOver) {
    if (!scoreboardShown) {
      scoreboardShown = true;
      showScoreboardOverlay();
    }
    return; // Stop the game loop until the player submits their score
  }
  
  requestAnimationFrame(gameLoop);
}

// Start the game loop
requestAnimationFrame(gameLoop);
