// Get the canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Define the player (Red Panda placeholder) with jump physics properties
const player = {
  x: 50,
  width: 30,
  height: 30,
  speed: 3,
  dx: 0,
  dy: 0,
  gravity: 0.5,
  jumpForce: -10,
  isJumping: false,
  groundLevel: canvas.height - 30 - 10, // 10px padding from bottom
  y: 0 // will be set below
};
player.y = player.groundLevel; // Start on the ground

// Draw the player on the canvas
function drawPlayer() {
  ctx.fillStyle = 'red';
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Clear the canvas for the next frame
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Update the player's position and apply gravity for jump physics
function updatePlayer() {
  // Update horizontal position
  player.x += player.dx;
  
  // Apply gravity if the player is in the air or moving upward
  if (player.y < player.groundLevel || player.dy < 0) {
    player.dy += player.gravity;
    player.y += player.dy;
  }
  
  // If player goes below ground, reset to ground level
  if (player.y > player.groundLevel) {
    player.y = player.groundLevel;
    player.dy = 0;
    player.isJumping = false;
  }
  
  // Keep player within horizontal bounds
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
}

// Main game loop: update the scene and redraw
function gameLoop() {
  clearCanvas();
  drawPlayer();
  updatePlayer();
  requestAnimationFrame(gameLoop);
}

// Keyboard controls for desktop
function keyDownHandler(e) {
  if (e.key === 'ArrowRight' || e.key === 'Right') {
    player.dx = player.speed;
  } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
    player.dx = -player.speed;
  } else if (e.key === 'ArrowUp' || e.key === 'Up') {
    // Trigger jump if the player is not already jumping
    if (!player.isJumping) {
      player.dy = player.jumpForce;
      player.isJumping = true;
    }
  }
}

function keyUpHandler(e) {
  if (e.key === 'ArrowRight' || e.key === 'Right' ||
      e.key === 'ArrowLeft'  || e.key === 'Left') {
    player.dx = 0;
  }
}

document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);

// Mobile touch controls
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const jumpBtn = document.getElementById('jumpBtn');

if (leftBtn && rightBtn && jumpBtn) {
  leftBtn.addEventListener('touchstart', function(e) {
    e.preventDefault();
    player.dx = -player.speed;
  });
  leftBtn.addEventListener('touchend', function(e) {
    e.preventDefault();
    if (player.dx < 0) player.dx = 0;
  });
  
  rightBtn.addEventListener('touchstart', function(e) {
    e.preventDefault();
    player.dx = player.speed;
  });
  rightBtn.addEventListener('touchend', function(e) {
    e.preventDefault();
    if (player.dx > 0) player.dx = 0;
  });
  
  jumpBtn.addEventListener('touchstart', function(e) {
    e.preventDefault();
    if (!player.isJumping) {
      player.dy = player.jumpForce;
      player.isJumping = true;
    }
  });
}

// Enable full-screen mode on mobile when the canvas is touched
canvas.addEventListener('touchstart', function() {
  if (!document.fullscreenElement) {
    canvas.requestFullscreen().catch(err => {
      console.error("Error attempting to enable full-screen mode:", err.message);
    });
  }
});

// Start the game loop
gameLoop();
