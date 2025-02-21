// Get the canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Define the player (Red Panda placeholder) as a simple rectangle
const player = {
  x: 50,
  y: canvas.height - 60, // start near the bottom
  width: 30,
  height: 30,
  speed: 3,
  dx: 0,
  dy: 0
};

// Draw the player on the canvas
function drawPlayer() {
  ctx.fillStyle = 'red'; // red color for our red panda
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Clear the canvas for the next frame
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Update the player's position
function updatePlayer() {
  player.x += player.dx;
  player.y += player.dy;

  // Prevent the player from going out of bounds
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
  if (player.y < 0) player.y = 0;
  if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
}

// Main game loop: clears the canvas, draws the player, updates positions, and repeats
function gameLoop() {
  clearCanvas();
  drawPlayer();
  updatePlayer();
  requestAnimationFrame(gameLoop);
}

// Handle keyboard inputs to move the player
function keyDownHandler(e) {
  if (e.key === 'ArrowRight' || e.key === 'Right') {
    player.dx = player.speed;
  } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
    player.dx = -player.speed;
  } else if (e.key === 'ArrowUp' || e.key === 'Up') {
    player.dy = -player.speed;
  } else if (e.key === 'ArrowDown' || e.key === 'Down') {
    player.dy = player.speed;
  }
}

function keyUpHandler(e) {
  // Stop horizontal movement when arrow keys are released
  if (e.key === 'ArrowRight' || e.key === 'Right' ||
      e.key === 'ArrowLeft'  || e.key === 'Left') {
    player.dx = 0;
  }
  // Stop vertical movement when arrow keys are released
  if (e.key === 'ArrowUp' || e.key === 'Up' ||
      e.key === 'ArrowDown'  || e.key === 'Down') {
    player.dy = 0;
  }
}

// Attach event listeners for keyboard input
document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);

// Start the game loop
gameLoop();
