const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions (you may want to adjust these for responsiveness)
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gameSpeed = 5;

// Game character properties
const player = {
  x: 50,
  y: canvas.height - 100, // starting from near the bottom
  width: 50,
  height: 50,
  dy: 0, // vertical velocity
  gravity: 0.8,
  jumpStrength: -15,
  isJumping: false
};

// Listen for keyboard input (desktop)
document.addEventListener('keydown', e => {
  if (e.code === 'Space' && !player.isJumping) {
    player.dy = player.jumpStrength;
    player.isJumping = true;
  }
});

// Listen for touch events (mobile)
canvas.addEventListener('touchstart', e => {
  if (!player.isJumping) {
    player.dy = player.jumpStrength;
    player.isJumping = true;
  }
});

// Simple game loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Update player position
  player.y += player.dy;
  player.dy += player.gravity;
  
  // Floor collision detection
  if (player.y + player.height >= canvas.height - 50) { // 50px ground height
    player.y = canvas.height - 50 - player.height;
    player.dy = 0;
    player.isJumping = false;
  }
  
  // Draw ground
  ctx.fillStyle = '#888';
  ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
  
  // Draw player (simple rectangle)
  ctx.fillStyle = '#333';
  ctx.fillRect(player.x, player.y, player.width, player.height);
  
  // Continue the loop
  requestAnimationFrame(gameLoop);
}

gameLoop();