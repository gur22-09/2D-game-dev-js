/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("c");
/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d");

const CANVAS_HEIGHT = (canvas.height = 1000);
const CANVAS_WIDTH = (canvas.width = 500);

const enemyImg = new Image();
enemyImg.src = "./assets/enemy1.png";
let gameFrame = 0;
const enemyCount = 10;

class Enemy {
  constructor(image, spriteLength) {
    this.image = image;
    this.spriteWidth = 293;
    this.spriteHeight = 155;
    this.width = this.spriteWidth / 2.5;
    this.height = this.spriteHeight / 2.5;
    this.x = Math.random() * (CANVAS_WIDTH - this.width); // contain enemies within canvas
    this.y = Math.random() * (CANVAS_HEIGHT - this.height); // contain enemies within canvas
    this.spriteLength = spriteLength;
    this.positionIndex = 0;
    this.staggerFrame = Math.floor(Math.random() * 5 + 1);
    this.speed = Math.random() * 4 - 2; // [-2 2]
  }

  update() {
    this.x += Math.random() * 8 - 4;
    this.y += Math.random() * 8 - 4;
    this.positionIndex =
      Math.floor(gameFrame / this.staggerFrame) % this.spriteLength;
  }

  draw() {
    // ctx.strokeRect(this.x, this.y, this.width, this.height);
    ctx.drawImage(
      enemyImg,
      this.positionIndex * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}

const enemies = Array(enemyCount)
  .fill()
  .map(() => new Enemy(enemyImg, 6));

function animate() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  enemies.forEach((enemy) => {
    enemy.update();
    enemy.draw();
  });
  gameFrame++;
  requestAnimationFrame(animate);
}

animate();
