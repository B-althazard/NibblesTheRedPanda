// Get the canvas and its context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Resize the canvas to fill the viewport and update player ground level
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  player.groundLevel = canvas.height - player.height - 10; // 10px margin from bottom
  // Ensure player is not below the ground after resize
  if (player.y > player.groundLevel) {
    player.y = player.groundLevel;
    player.dy = 0;
    player.isJumping = false;
  }
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Define the player with jump physics properties
const player = {
  x: 50,
  width: 30,
  height: 30,
  y: 0,           // Will be set to groundLevel shortly
  speed: 3,
  dx: 0,
  dy: 0,
  gravity: 0.5,
  jumpForce: -12, // Adjusted for a nice jump arc
  isJumping: false,
  groundLevel: canvas.height - 30 - 10
};
player.y = player.groundLevel; // Start on the ground

// Draw the player (red rectangle)
function drawPlayer() {
  ctx.fillStyle = 'red';
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Clear the canvas for each frame
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Update the player's position and handle gravity/jump physics
function updatePlayer() {
  player.x += player.dx;
  
  // Apply gravity if the player is airborne or moving upward
  if (player.y < player.groundLevel || player.dy < 0) {
    player.dy += player.gravity;
    player.y += player.dy;
  }
  
  // Reset if player lands on the ground
  if (player.y >= player.groundLevel) {
    player.y = player.groundLevel;
    player.dy = 0;
    player.isJumping = false;
  }
  
  // Prevent moving out of canvas bounds horizontally
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
}

// Main game loop
function gameLoop() {
  clearCanvas();
  drawPlayer();
  updatePlayer();
  requestAnimationFrame(gameLoop);
}

// --- Keyboard Controls (for desktop) ---
document.addEventListener('keydown', function(e) {
  if (e.key === 'ArrowRight' || e.key === 'Right') {
    player.dx = player.speed;
  } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
    player.dx = -player.speed;
  } else if (e.key === 'ArrowUp' || e.key === 'Up') {
    if (!player.isJumping && player.y === player.groundLevel) {
      player.dy = player.jumpForce;
      player.isJumping = true;
    }
  }
});
document.addEventListener('keyup', function(e) {
  if (e.key === 'ArrowRight' || e.key === 'Right' ||
      e.key === 'ArrowLeft' || e.key === 'Left') {
    player.dx = 0;
  }
});

// --- Touch Controls ---
// Variables to detect double-tap
let lastTap = 0;
const doubleTapThreshold = 300; // milliseconds

canvas.addEventListener('touchstart', function(e) {
  const touch = e.changedTouches[0];
  const currentTime = new Date().getTime();

  // Check for double-tap
  if (currentTime - lastTap < doubleTapThreshold) {
    // Double-tap detected: Trigger jump if on the ground
    if (!player.isJumping && player.y === player.groundLevel) {
      player.dy = player.jumpForce;
      player.isJumping = true;
    }
    lastTap = 0; // Reset lastTap to prevent triple-tap misfires
  } else {
    // Not a double-tap: record this tap and determine movement direction
    lastTap = currentTime;
    if (touch.clientX > canvas.width / 2) {
      player.dx = player.speed;
    } else {
      player.dx = -player.speed;
    }
  }
});

// On touchend, stop horizontal movement
canvas.addEventListener('touchend', function(e) {
  player.dx = 0;
});

// Request full-screen on first touch (only once)
canvas.addEventListener('touchstart', function() {
  if (!document.fullscreenElement) {
    canvas.requestFullscreen().catch(err => {
      console.error("Full-screen request failed:", err);
    });
  }
}, { once: true });

// Start the game loop
gameLoop();
