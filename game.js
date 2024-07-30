class mainScene extends Phaser.Scene {
  constructor() {
    super({ key: "mainScene" });
  }

  preload() {
    this.load.image("player", "assets/mc.png");
    this.load.image("coin", "assets/coin.png");
    this.load.image("obstacle", "assets/obstacle.png");
  }

  create() {
    this.createGameUI();
    this.createGameOverUI();
  }

  createGameUI() {
    this.gameOverShown = false;

    // Initialize game state
    this.resetGameState();

    // Create player
    this.player = this.physics.add.sprite(100, 100, "player");

    // Create coin
    this.coin = this.physics.add.sprite(300, 300, "coin").setScale(0.05);

    // Initialize score and high score
    this.score = 0;
    this.highScore = localStorage.getItem("highScore") || 0;

    // Create score and high score text
    let style = { font: "20px Arial", fill: "#fff" };
    this.scoreText = this.add.text(20, 20, "score: " + this.score, style);
    this.highScoreText = this.add.text(
      20,
      50,
      "high score: " + this.highScore,
      style
    );

    // Setup controls
    this.arrow = this.input.keyboard.createCursorKeys();

    // Create obstacles group
    this.obstacles = this.physics.add.group({
      defaultKey: "obstacle",
      maxSize: 10,
    });

    // Create timer for spawning obstacles
    this.obstacleTimer = this.time.addEvent({
      delay: 1000,
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true,
    });

    // Setup collisions
    this.physics.add.overlap(
      this.player,
      this.obstacles,
      this.gameOver,
      null,
      this
    );
    this.physics.add.overlap(this.player, this.coin, this.hit, null, this);
  }

  update() {
    if (this.gameOverShown) return; // Prevent player movement if game is over

    if (this.arrow.right.isDown) {
      this.player.x += 3;
    } else if (this.arrow.left.isDown) {
      this.player.x -= 3;
    }

    if (this.arrow.down.isDown) {
      this.player.y += 3;
    } else if (this.arrow.up.isDown) {
      this.player.y -= 3;
    }
  }

  hit() {
    if (this.gameOverShown) return; // Prevent hitting coin if game is over

    this.coin.setPosition(
      Phaser.Math.Between(100, 600),
      Phaser.Math.Between(100, 300)
    );
    this.score += 10;

    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem("highScore", this.highScore);
    }

    this.scoreText.setText("score: " + this.score);
    this.highScoreText.setText("high score: " + this.highScore);

    this.tweens.add({
      targets: this.player,
      duration: 200,
      scaleX: 1.2,
      scaleY: 1.2,
      yoyo: true,
    });
  }

  spawnObstacle() {
    if (this.gameOverShown) return; // Prevent spawning obstacles if game is over

    let obstacle = this.obstacles.create(
      800,
      Phaser.Math.Between(100, 400),
      "obstacle"
    );
    if (obstacle) {
      obstacle.body.velocity.x = -200;
      obstacle.setCollideWorldBounds(true);
      obstacle.body.onWorldBounds = true;
      obstacle.body.world.on("worldbounds", function (body) {
        if (body.gameObject === obstacle) {
          obstacle.destroy();
        }
      });
    }
  }

  gameOver() {
    if (this.gameOverShown) return; // Prevent multiple game over triggers

    this.gameOverShown = true;
    this.score = 0;
    this.scoreText.setText("score: 0");

    this.obstacleTimer.remove(false); // Stop the obstacle spawning timer
    this.obstacles.clear(true, true); // Clear all existing obstacles

    // Show game over UI
    this.gameOverText.setVisible(true);
    this.restartText.setVisible(true);
  }

  createGameOverUI() {
    // Create game over text
    this.gameOverText = this.add
      .text(
        this.cameras.main.centerX,
        this.cameras.main.centerY - 50,
        "Game Over",
        { font: "40px Arial", fill: "#fff" }
      )
      .setOrigin(0.5)
      .setVisible(false);

    // Create restart text
    this.restartText = this.add
      .text(
        this.cameras.main.centerX,
        this.cameras.main.centerY + 50,
        "Restart",
        { font: "30px Arial", fill: "#ff0000", backgroundColor: "#000" }
      )
      .setOrigin(0.5)
      .setInteractive()
      .setVisible(false);

    // Handle restart functionality
    this.restartText.on("pointerdown", () => this.restartGame());
  }

  restartGame() {
    // Hide game over UI
    this.gameOverText.setVisible(false);
    this.restartText.setVisible(false);

    // Reset game state and UI
    this.resetGameState();
    this.createGameUI();
  }

  resetGameState() {
    // Clear existing obstacles and remove obstacle timer
    if (this.obstacles) {
      this.obstacles.clear(true, true);
    }

    if (this.obstacleTimer) {
      this.obstacleTimer.remove(false);
    }

    // Reset player and coin positions
    if (this.player) {
      this.player.setPosition(100, 100);
    }

    if (this.coin) {
      this.coin.setPosition(300, 300);
    }
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: 500,
  backgroundColor: "#3498db",
  scene: mainScene,
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
  parent: "game",
});
