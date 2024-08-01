class mainScene extends Phaser.Scene {
  constructor() {
    super({ key: "mainScene" });
  }

  preload() {
    this.load.image("background", "assets/b1.webp");
    this.load.image("player", "assets/mc.png");
    this.load.image("coin", "assets/coin.png");
    this.load.image("obstacle", "assets/obstacle.png");
  }

  create() {
    // Add background image
    this.add
      .image(0, 0, "background")
      .setOrigin(0)
      .setScale(window.innerWidth / 800, 500 / 400);

    // Create the start text
    this.createStartText();

    // Create game over UI
    this.createGameOverUI();
  }

  createStartText() {
    this.startText = this.add
      .text(this.cameras.main.centerX / 2, this.cameras.main.centerY, "Start", {
        font: "40px Arial",
        fill: "#fff",
        stroke: "#000",
        strokeThickness: 6,
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: "#000",
          blur: 4,
          stroke: true,
          fill: true,
        },
        backgroundColor: "#00ff00", // Green background
      })
      .setOrigin(0.5)
      .setInteractive()
      .setPadding(20)
      .setStyle({
        backgroundColor: "#00ff00",
        fill: "#fff",
        fontSize: "40px",
        fontFamily: "Arial",
        fontWeight: "bold",
      });

    // Add hover effects
    this.startText.on("pointerover", () => {
      this.startText.setStyle({
        fill: "#ff0",
        backgroundColor: "#00aa00",
      });
    });

    this.startText.on("pointerout", () => {
      this.startText.setStyle({
        fill: "#fff",
        backgroundColor: "#00ff00",
      });
    });

    // Add click event to the "Start" text
    this.startText.on("pointerdown", () => this.startGame());
  }

  startGame() {
    // Hide the start text and show game elements
    this.startText.setVisible(false);
    this.createGameUI();
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
    if (this.gameOverShown || !this.player) return;

    // Debugging: Print the player's position
    // console.log(`Player position: x=${this.player.x}, y=${this.player.y}`);

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
    if (this.gameOverShown) return;

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
    if (this.gameOverShown) return;

    let obstacle = this.obstacles.create(
      800,
      Phaser.Math.Between(100, 400),
      "obstacle"
    );
    if (obstacle) {
      obstacle.body.velocity.x = -200;
      obstacle.setCollideWorldBounds(true);
      obstacle.body.onWorldBounds = true;
      this.physics.world.on("worldbounds", function (body) {
        if (body.gameObject === obstacle) {
          obstacle.destroy();
        }
      });
    }
  }

  gameOver() {
    if (this.gameOverShown) return;

    this.gameOverShown = true;
    this.score = 0;
    this.scoreText.setText("score: 0");

    this.obstacleTimer.remove(false);
    this.obstacles.clear(true, true);

    this.gameOverText.setVisible(true);
    this.restartText.setVisible(true);
  }

  createGameOverUI() {
    // Create the "Game Over" text
    this.gameOverText = this.add
      .text(
        this.cameras.main.centerX / 2,
        this.cameras.main.centerY - 50,
        "Game Over",
        {
          font: "40px Arial",
          fill: "#ff0000",
          stroke: "#000",
          strokeThickness: 6,
          shadow: {
            offsetX: 2,
            offsetY: 2,
            color: "#000",
            blur: 4,
            stroke: true,
            fill: true,
          },
        }
      )
      .setOrigin(0.5)
      .setVisible(false);

    // Create the "Restart" text
    this.restartText = this.add
      .text(
        this.cameras.main.centerX / 2,
        this.cameras.main.centerY + 50,
        "Restart",
        {
          font: "30px Arial",
          fill: "#00ff00",
          stroke: "#000",
          strokeThickness: 6,
          shadow: {
            offsetX: 2,
            offsetY: 2,
            color: "#000",
            blur: 4,
            stroke: true,
            fill: true,
          },
          backgroundColor: "#000",
        }
      )
      .setOrigin(0.5)
      .setPadding(10)
      .setInteractive() // Make it interactive
      .setVisible(false);

    // Add click event to the "Restart" text
    this.restartText.on("pointerdown", () => this.restartGame());
  }

  restartGame() {
    this.gameOverText.setVisible(false);
    this.restartText.setVisible(false);

    this.resetGameState();
    this.startGame(); // Restart the game
  }

  resetGameState() {
    if (this.obstacles) {
      this.obstacles.clear(true, true);
    }

    if (this.obstacleTimer) {
      this.obstacleTimer.remove(false);
    }

    if (this.player) {
      this.player.destroy();
    }

    if (this.coin) {
      this.coin.destroy();
    }

    this.gameOverShown = false;
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
