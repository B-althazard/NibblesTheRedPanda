const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions for responsiveness
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gameSpeed = 5;
let score = 0;
let gameOver = false;
let obstacles = [];
let obstacleTimer = 0;
let obstacleInterval = 1500; // Initial interval in milliseconds
let lastTime = 0;

// Player object
const player = {
  x: 50,
  y: canvas.height - 100, // Starting near the bottom
  width: 50,
  height: 50,
  dy: 0, // Vertical velocity
  gravity: 0.8,
  jumpStrength: -15,
  isJumping: false
};

// Keyboard input (desktop)
document.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    if (gameOver) {
      resetGame();
    } else if (!player.isJumping) {
      player.dy = player.jumpStrength;
      player.isJumping = true;
    }
  }
});

// Touch input (mobile)
canvas.addEventListener('touchstart', e => {
  if (gameOver) {
    resetGame();
  } else if (!player.isJumping) {
    player.dy = player.jumpStrength;
    player.isJumping = true;
  }
});

// Reset game state on restart
function resetGame() {
  score = 0;
  gameOver = false;
  obstacles = [];
  player.y = canvas.height - 100;
  player.dy = 0;
  player.isJumping = false;
  obstacleTimer = 0;
  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
}

// Simple AABB collision detection
function isColliding(rect1, rect2) {
  return rect1.x < rect2.x + rect2.width &&
         rect1.x + rect1.width > rect2.x &&
         rect1.y < rect2.y + rect2.height &&
         rect1.y + rect1.height > rect2.y;
}

// Obstacle constructor function
function Obstacle() {
  this.width = 20 + Math.random() * 30;  // Width between 20 and 50
  this.height = 30 + Math.random() * 30;  // Height between 30 and 60
  this.x = canvas.width;
  this.y = canvas.height - 50 - this.height; // Positioned on the "ground" (50px high)
  this.speed = gameSpeed;
}

// Leaderboard functions using localStorage
function getLeaderboard() {
  let leaderboard = localStorage.getItem('leaderboard');
  return leaderboard ? JSON.parse(leaderboard) : [];
}

function updateLeaderboard(newScore) {
  let leaderboard = getLeaderboard();
  leaderboard.push(Math.floor(newScore));
  leaderboard.sort((a, b) => b - a); // Sort descending
  leaderboard = leaderboard.slice(0, 5); // Keep top 5 scores
  localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}

// Main game loop using timestamp for deltaTime
function gameLoop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  let deltaTime = timestamp - lastTime;
  lastTime = timestamp;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Update player's position and gravity effect
  player.y += player.dy;
  player.dy += player.gravity;
  
  // Prevent falling below the ground
  if (player.y + player.height >= canvas.height - 50) {
    player.y = canvas.height - 50 - player.height;
    player.dy = 0;
    player.isJumping = false;
  }
  
  // Update obstacle timer and spawn new obstacles
  obstacleTimer += deltaTime;
  if (obstacleTimer > obstacleInterval) {
    obstacles.push(new Obstacle());
    obstacleTimer = 0;
    // Randomize next interval between 1000ms and 2000ms
    obstacleInterval = 1000 + Math.random() * 1000;
  }
  
  // Update and draw obstacles; check for collisions
  for (let i = obstacles.length - 1; i >= 0; i--) {
    let obs = obstacles[i];
    obs.x -= obs.speed;
    ctx.fillStyle = '#228B22'; // Obstacle color (green)
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    
    if (isColliding(player, obs)) {
      gameOver = true;
      updateLeaderboard(score);
    }
    
    // Remove obstacles that have moved off-screen
    if (obs.x + obs.width < 0) {
      obstacles.splice(i, 1);
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
  
  // If game over, display overlay with restart instructions and leaderboard
  if (gameOver) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '20px Arial';
    ctx.fillText('Press Space or Tap to Restart', canvas.width / 2, canvas.height / 2 + 20);
    
    // Show the leaderboard
    let leaderboard = getLeaderboard();
    ctx.fillText('Leaderboard', canvas.width / 2, canvas.height / 2 + 60);
    leaderboard.forEach((entry, index) => {
      ctx.fillText((index + 1) + '. ' + entry, canvas.width / 2, canvas.height / 2 + 90 + index * 20);
    });
    return;
  }
  
  requestAnimationFrame(gameLoop);
}

// Start the game loop
requestAnimationFrame(gameLoop);
