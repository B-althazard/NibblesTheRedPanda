const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- Responsive Canvas Scaling ---
function resizeCanvas() {
  let dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// --- Game Variables ---
let gameSpeed = 5;
let score = 0;
let gameOver = false;
let scoreboardShown = false; // flag for overlay display

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

// Player object (with double jump support)
const player = {
  x: 50,
  y: canvas.height - 100,
  width: 50,
  height: 50,
  dy: 0,
  gravity: 0.8,
  jumpStrength: -15,
  jumpCount: 0,
  isJumping: false
};

// --- Scoreboard Overlay Elements ---
const overlay = document.getElementById('scoreboardOverlay');
const finalScoreElement = document.getElementById('finalScore');
const playerNameInput = document.getElementById('playerName');
const submitScoreButton = document.getElementById('submitScore');
const playAgainButton = document.getElementById('playAgain');
const leaderboardContainer = document.getElementById('leaderboardContainer');
const leaderboardList = document.getElementById('leaderboardList');

// --- Event Listeners for Controls ---
// Desktop: spacebar jump
document.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    if (!gameOver && player.jumpCount < 2) {
      player.dy = player.jumpStrength;
      player.isJumping = true;
      player.jumpCount++;
    }
  }
});
// Mobile: touchstart jump with preventDefault to avoid scrolling issues
canvas.addEventListener('touchstart', function(e) {
  e.preventDefault();
  if (!gameOver && player.jumpCount < 2) {
    player.dy = player.jumpStrength;
    player.isJumping = true;
    player.jumpCount++;
  }
}, { passive: false });

// --- Reset Game State ---
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
  
  // Reset overlay UI elements
  playerNameInput.style.display = 'block';
  submitScoreButton.style.display = 'inline-block';
  playAgainButton.style.display = 'none';
  leaderboardContainer.style.display = 'none';
  playerNameInput.value = '';
  overlay.style.display = 'none';
  
  requestAnimationFrame(gameLoop);
}

// --- Collision Detection Functions ---
function isColliding(rect1, rect2) {
  return rect1.x < rect2.x + rect2.width &&
         rect1.x + rect1.width > rect2.x &&
         rect1.y < rect2.y + rect2.height &&
         rect1.y + rect1.height > rect2.y;
}
function isCollidingCoin(player, coin) {
  return player.x < coin.x + coin.radius &&
         player.x + player.width > coin.x - coin.radius &&
         player.y < coin.y + coin.radius &&
         player.y + player.height > coin.y - coin.radius;
}

// --- Constructors ---
// Obstacle with optional jumping behavior
function Obstacle() {
  this.width = 20 + Math.random() * 30;
  this.height = 30 + Math.random() * 30;
  this.x = canvas.width;
  this.baseY = canvas.height - 50 - this.height;
  this.y = this.baseY;
  this.speed = gameSpeed;
  this.jumping = Math.random() < 0.3;
  if (this.jumping) {
    this.jumpAmplitude = 20 + Math.random() * 10;
    this.jumpSpeed = 0.005 + Math.random() * 0.005;
    this.phase = 0;
  }
}
// Platform where the player can land
function Platform() {
  this.width = 100 + Math.random() * 100;
  this.height = 10;
  this.y = canvas.height - 200 - Math.random() * 150;
  this.x = canvas.width;
  this.speed = gameSpeed;
}
// Coin constructor (collect for extra points)
function Coin() {
  this.radius = 10;
  this.x = canvas.width;
  this.y = canvas.height - 250 + Math.random() * 150;
  this.speed = gameSpeed;
}

// --- Leaderboard Functions ---
// Get leaderboard from localStorage (array of objects {name, score})
function getLeaderboard() {
  let leaderboard = localStorage.getItem('leaderboard');
  try {
    leaderboard = leaderboard ? JSON.parse(leaderboard) : [];
  } catch (e) {
    leaderboard = [];
  }
  // Filter out any invalid entries
  leaderboard = leaderboard.filter(entry => entry && entry.name && typeof entry.score === 'number');
  return leaderboard;
}
// Update leaderboard in localStorage
function updateLeaderboard(newEntry) {
  let leaderboard = getLeaderboard();
  leaderboard.push(newEntry);
  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard = leaderboard.slice(0, 5);
  localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}
// Update leaderboard UI in the overlay
function updateLeaderboardUI() {
  let leaderboard = getLeaderboard();
  leaderboardList.innerHTML = '';
  leaderboard.forEach(entry => {
    let li = document.createElement('li');
    li.textContent = `${entry.name} - ${entry.score}`;
    leaderboardList.appendChild(li);
  });
  leaderboardContainer.style.display = 'block';
}

// --- Overlay Handling ---
// Show scoreboard overlay with final score
function showScoreboardOverlay() {
  finalScoreElement.textContent = Math.floor(score);
  overlay.style.display = 'flex';
}

// Submit score event listener
submitScoreButton.addEventListener('click', () => {
  let name = playerNameInput.value.trim();
  if (name === '') {
    name = 'Anonymous';
  }
  name = name.substring(0, 16);
  const newEntry = { name: name, score: Math.floor(score) };
  updateLeaderboard(newEntry);
  updateLeaderboardUI();
  
  // Hide name input and submit button, show play again button
  playerNameInput.style.display = 'none';
  submitScoreButton.style.display = 'none';
  playAgainButton.style.display = 'inline-block';
});

// Play again event listener
playAgainButton.addEventListener('click', () => {
  resetGame();
});

// --- Main Game Loop ---
function gameLoop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  let deltaTime = timestamp - lastTime;
  lastTime = timestamp;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Update player with gravity
  player.y += player.dy;
  player.dy += player.gravity;
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
  ctx.fillStyle = '#964B00';
  for (let i = platforms.length - 1; i >= 0; i--) {
    let plat = platforms[i];
    plat.x -= plat.speed;
    ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
    if (plat.x + plat.width < 0) {
      platforms.splice(i, 1);
    }
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
  
  // Update and draw obstacles
  obstacleTimer += deltaTime;
  if (obstacleTimer > obstacleInterval) {
    obstacles.push(new Obstacle());
    obstacleTimer = 0;
    obstacleInterval = 1000 + Math.random() * 1000;
  }
  for (let i = obstacles.length - 1; i >= 0; i--) {
    let obs = obstacles[i];
    obs.x -= obs.speed;
    if (obs.jumping) {
      obs.phase += deltaTime * obs.jumpSpeed;
      obs.y = obs.baseY - Math.sin(obs.phase) * obs.jumpAmplitude;
    }
    ctx.fillStyle = '#228B22';
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    if (isColliding(player, obs)) {
      gameOver = true;
    }
    if (obs.x + obs.width < 0) {
      obstacles.splice(i, 1);
    }
  }
  
  // Update and draw coins
  coinTimer += deltaTime;
  if (coinTimer > coinInterval) {
    coins.push(new Coin());
    coinTimer = 0;
    coinInterval = 1500 + Math.random() * 1000;
  }
  ctx.fillStyle = '#FFD700';
  for (let i = coins.length - 1; i >= 0; i--) {
    let coin = coins[i];
    coin.x -= coin.speed;
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
    ctx.fill();
    if (isCollidingCoin(player, coin)) {
      score += 10;
      coins.splice(i, 1);
      continue;
    }
    if (coin.x + coin.radius < 0) {
      coins.splice(i, 1);
    }
  }
  
  // Update score and draw it
  score += deltaTime * 0.01;
  ctx.fillStyle = '#000';
  ctx.font = '20px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('Score: ' + Math.floor(score), 10, 30);
  
  // Draw ground
  ctx.fillStyle = '#888';
  ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
  
  // Draw player
  ctx.fillStyle = '#333';
  ctx.fillRect(player.x, player.y, player.width, player.height);
  
  if (gameOver) {
    if (!scoreboardShown) {
      scoreboardShown = true;
      showScoreboardOverlay();
    }
    return;
  }
  
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
