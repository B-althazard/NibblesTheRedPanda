const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Game window variables
let player = {x: 400, y: 350};
let speed = 1;
let gravity = 0.3;

function generatePlatform() {
  const width = Math.random() * (canvas.width - 100) + 50;
  const height = Math.floor(Math.random() * 250) + 20;
  const color = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;

  ctx.fillStyle = color;
  ctx.fillRect(width, canvas.height - height, width + 100, height);
}

function update() {
  // Generate platforms
  if (player.x > canvas.width) generatePlatform();

  // Player movement controls
  if (player.y >= canvas.height) {
    player.y = 350;
    player.score = 0;
  }

  // Collision detection and scoring
  let platformScore = 0;
  ctx.fillStyle = 'black';
  for (let i = -100; i < canvas.width + 100; i += 25) {
    if (player.y > canvas.height - Math.abs(canvas.height - player.y)) {
      platformScore++;
    }
  }
  ctx.fillText(`Score: ${platformScore}`, canvas.width - 10, 40);

  // Gravity
  player.y += gravity;

  // Game over condition
  if (player.x < -10) {
    player.x = canvas.width / 2;
    player.score = 0;
    player.y = 350;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'black';
  ctx.fillRect(player.x, player.y, 10, 10);
}

// Game loop
setInterval(draw, 1000 / 60);
setInterval(update, 1000 / 60);