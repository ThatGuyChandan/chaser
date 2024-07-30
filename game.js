class mainScene extends Phaser.Scene {
  constructor() {
    super({ key: "mainScene" });
    this.highScore = 0;
  }

  preload() {
    this.load.image("player", "./assets/mc.jpg");
    this.load.image("coin", "./assets/coin.png");
    this.load.image("obstacle", "./assets/obstacle.png");
    this.load.audio("coinSound", "./assets/coin-sound.mp3");
  }

  create() {
    this.player = this.physics.add.sprite(100, 100, "player");
    this.coin = this.physics.add.sprite(300, 300, "coin");
    this.obstacles = this.physics.add.group();
    this.createObstacle();
    this.score = 0;

    let style = { font: "20px Arial", fill: "#fff" };
    this.scoreText = this.add.text(20, 20, "Score: " + this.score, style);
    this.highScoreText = this.add.text(
      20,
      50,
      "High Score: " + this.highScore,
      style
    );
    this.arrow = this.input.keyboard.createCursorKeys();
    this.coinSound = this.sound.add("coinSound");

    this.physics.add.overlap(this.player, this.coin, this.hit, null, this);
    this.physics.add.collider(
      this.player,
      this.obstacles,
      this.gameOver,
      null,
      this
    );
  }

  update() {
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

  createObstacle() {
    const obstacleX = Phaser.Math.Between(100, 700);
    const obstacleY = Phaser.Math.Between(100, 400);
    const obstacle = this.obstacles.create(obstacleX, obstacleY, "obstacle");
    obstacle.setVelocity(
      Phaser.Math.Between(-100, 100),
      Phaser.Math.Between(-100, 100)
    );
    obstacle.setBounce(1);
    obstacle.setCollideWorldBounds(true);
  }

  hit(player, coin) {
    this.coin.x = Phaser.Math.Between(100, 700);
    this.coin.y = Phaser.Math.Between(100, 400);
    this.score += 10;
    this.scoreText.setText("Score: " + this.score);
    this.coinSound.play();

    this.tweens.add({
      targets: this.player,
      duration: 200,
      scaleX: 1.2,
      scaleY: 1.2,
      yoyo: true,
    });
  }

  gameOver(player, obstacle) {
    this.physics.pause();
    player.setTint(0xff0000);

    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.highScoreText.setText("High Score: " + this.highScore);
    }

    let style = { font: "40px Arial", fill: "#fff" };
    this.add.text(400, 250, "Game Over", style).setOrigin(0.5);

    this.time.delayedCall(
      2000,
      () => {
        let restartStyle = { font: "20px Arial", fill: "#fff" };
        let restartText = this.add
          .text(400, 300, "Press R to Restart", restartStyle)
          .setOrigin(0.5);
        this.input.keyboard.once("keydown-R", () => {
          this.scene.restart();
          this.player.clearTint();
        });
      },
      [],
      this
    );
  }
}

new Phaser.Game({
  width: 800,
  height: 500,
  backgroundColor: "#3498db",
  scene: mainScene,
  physics: { default: "arcade" },
  parent: "game",
});
