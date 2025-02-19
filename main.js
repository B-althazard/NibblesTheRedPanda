window.onload = function() {
  // Initialize score variables
  var score = 0;
  var allTimeHigh = localStorage.getItem('allTimeHigh') || 0;
  var allTimeLow = localStorage.getItem('allTimeLow') || 0;
  var player, scoreText, highScoreText, lowScoreText;
  var coins, enemies, ground;

  // Configure the Phaser game
  var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 600 },
        debug: false
      }
    },
    scene: {
      preload: preload,
      create: create,
      update: update
    }
  };

  var game = new Phaser.Game(config);

  // Preload assets
  function preload() {
    this.load.image('background', 'assets/background.png');  // Bamboo forest background
    this.load.image('ground', 'assets/ground.png');          // Ground/platform image
    this.load.image('redpanda', 'assets/redpanda.png');      // Red Panda character
    this.load.image('coin', 'assets/coin.png');              // $Nibbels coin
    this.load.image('fud', 'assets/fud.png');                // FUD monster enemy
    this.load.image('bear', 'assets/bear.png');              // Bear enemy (bearmarket)
    this.load.image('jeeterz', 'assets/jeeterz.png');        // Jeeterz enemy (pump and dump)
  }

  // Create the game scene
  function create() {
    // Create a scrolling background using a tile sprite
    this.background = this.add.tileSprite(400, 300, 800, 600, 'background');

    // Create ground as a static platform
    ground = this.physics.add.staticGroup();
    ground.create(400, 580, 'ground').setScale(2).refreshBody();

    // Create the player (Red Panda)
    player = this.physics.add.sprite(100, 450, 'redpanda');
    player.setCollideWorldBounds(true);
    this.physics.add.collider(player, ground);

    // Create groups for coins and enemies
    coins = this.physics.add.group();
    enemies = this.physics.add.group();

    // Handle collisions: player collects coins
    this.physics.add.overlap(player, coins, collectCoin, null, this);
    // Handle collisions: player hits an enemy
    this.physics.add.collider(player, enemies, hitEnemy, null, this);

    // Set up touch input for jump
    this.input.on('pointerdown', jump, this);

    // Spawn coins every 2 seconds
    this.time.addEvent({ delay: 2000, callback: spawnCoin, callbackScope: this, loop: true });
    // Spawn enemies every 3 seconds
    this.time.addEvent({ delay: 3000, callback: spawnEnemy, callbackScope: this, loop: true });

    // Display the score and high/low score texts
    scoreText = this.add.text(16, 16, 'Score: ' + score, { fontSize: '32px', fill: '#fff' });
    highScoreText = this.add.text(16, 50, 'High: ' + allTimeHigh, { fontSize: '24px', fill: '#fff' });
    lowScoreText = this.add.text(16, 80, 'Low: ' + allTimeLow, { fontSize: '24px', fill: '#fff' });
  }

  // Update loop: scroll the background to simulate movement
  function update(time, delta) {
    this.background.tilePositionX += 2;
  }

  // Handle jump input (only when player is on the ground)
  function jump() {
    if (player.body.touching.down) {
      player.setVelocityY(-400);
    }
  }

  // Spawn a coin at a random vertical position
  function spawnCoin() {
    var coin = coins.create(800, Phaser.Math.Between(200, 500), 'coin');
    coin.setVelocityX(-200);
    coin.setCollideWorldBounds(false);
    coin.checkWorldBounds = true;
    coin.outOfBoundsKill = true;
  }

  // When a coin is collected, update the score
  function collectCoin(player, coin) {
    coin.disableBody(true, true);
    score += 10;
    updateScore();
  }

  // Spawn a random enemy (FUD monster, Bear, or Jeeterz) at a random position near the ground
  function spawnEnemy() {
    var enemyTypes = ['fud', 'bear', 'jeeterz'];
    var enemyType = Phaser.Utils.Array.GetRandom(enemyTypes);
    var enemy = enemies.create(800, Phaser.Math.Between(450, 550), enemyType);
    enemy.setVelocityX(-250);
    enemy.setCollideWorldBounds(false);
    enemy.checkWorldBounds = true;
    enemy.outOfBoundsKill = true;
  }

  // Handle collision with an enemy (for now, simply restart the game)
  function hitEnemy(player, enemy) {
    gameOver.call(this);
  }

  // Game Over: update local storage and restart the scene
  function gameOver() {
    // Update all-time high and low scores in local storage
    if (score > allTimeHigh) {
      allTimeHigh = score;
      localStorage.setItem('allTimeHigh', allTimeHigh);
    }
    if (allTimeLow === 0 || score < allTimeLow) {
      allTimeLow = score;
      localStorage.setItem('allTimeLow', allTimeLow);
    }
    // Restart the scene
    this.scene.restart();
  }

  // Update score display texts
  function updateScore() {
    scoreText.setText('Score: ' + score);
    highScoreText.setText('High: ' + allTimeHigh);
    lowScoreText.setText('Low: ' + allTimeLow);
  }
};
