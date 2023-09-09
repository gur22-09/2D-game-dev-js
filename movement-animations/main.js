/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("c");
/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d");

const CANVAS_HEIGHT = (canvas.height = 1000);
const CANVAS_WIDTH = (canvas.width = 500);

let gameFrame = 0;
const enemyCount = 100;

// Random Movement Enemy
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
      this.image,
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

// Sine wave movement enemy
class SineEnemy extends Enemy {
  constructor(image, spriteLength) {
    super(image, spriteLength);
    this.spriteWidth = 266;
    this.spriteHeight = 188;
    this.width = this.spriteWidth / 2;
    this.height = this.spriteHeight / 2;
    this.speed = Math.random() * 3 + 1;
    this.staggerFrame = Math.floor(Math.random() * 3 + 1);
    this.angle = 0;
    this.angleSpeed = Math.random() * 0.2;
    this.angleIncrementer = Math.random() * 7;
  }

  update() {
    this.x -= this.speed;
    this.y -= this.angleIncrementer * Math.cos(this.angle);

    if (this.x + this.width < 0) this.x = CANVAS_WIDTH;

    this.angle += this.angleSpeed;
    this.positionIndex =
      Math.floor(gameFrame / this.staggerFrame) % this.spriteLength;
  }
}

// Oscillatory movement enemy
class OscillatoryEnemy extends Enemy {
  constructor(image, spriteLength) {
    super(image, spriteLength);
    this.spriteWidth = 218;
    this.spriteHeight = 177;
    this.width = this.spriteWidth / 2;
    this.height = this.spriteHeight / 2;
    this.speed = Math.random() * 3 + 1;
    this.staggerFrame = Math.floor(Math.random() * 3 + 1);
    this.angle = 0;
    this.angleSpeed = Math.random() * 2 + 0.5;
    // this.waveIncrementer =  Math.random() * 200 + 50;
  }

  update() {
    // this.x =
    //   ((CANVAS_WIDTH - this.width) *
    //     (1 + Math.sin(this.angle * (Math.PI / 180)))) /
    //   2;

    // this.y =
    //   ((CANVAS_HEIGHT - this.height) *
    //     (1 +  Math.cos(this.angle * (Math.PI / 180)))) /
    //   2;

    this.x =
      (CANVAS_WIDTH / 2) * Math.cos(this.angle * (Math.PI / 200)) + // making sin angle value 3 time the cosine will cause 3 horizontal cycles and one vertical cyle
      (CANVAS_WIDTH / 2 - this.width / 2);
    this.y =
      (CANVAS_HEIGHT / 2) * Math.sin(this.angle * (Math.PI / 300)) +
      (CANVAS_HEIGHT / 2 - this.height / 2);

    if (this.x + this.width < 0) this.x = CANVAS_WIDTH;
    this.angle += this.angleSpeed;
    this.positionIndex =
      Math.floor(gameFrame / this.staggerFrame) % this.spriteLength;
  }
}

class RandomIntervalMovementEnemy extends Enemy {
  constructor(enemyImg, enemyCount) {
    super(enemyImg, enemyCount);
    this.spriteWidth = 213;
    this.spriteHeight = 212;
    this.width = this.spriteWidth / 2;
    this.height = this.spriteHeight / 2;
    this.x = Math.random() * (CANVAS_WIDTH - this.width);
    this.y = Math.random() * (CANVAS_HEIGHT - this.height);
    this.newX = Math.random() * (CANVAS_WIDTH - this.width);
    this.newY = Math.random() * (CANVAS_HEIGHT - this.height);
    this.interval = Math.floor(Math.random() * 200 + 50);
  }

  update() {
    if (gameFrame % this.interval === 0) {
      this.newX = Math.random() * (CANVAS_WIDTH - this.width);
      this.newY = Math.random() * (CANVAS_HEIGHT - this.height);
    }

    const dx = this.x - this.newX;
    const dy = this.y - this.newY;

    this.x -= dx / 80;
    this.y -= dy / 80;

    this.positionIndex =
      Math.floor(gameFrame / this.staggerFrame) % this.spriteLength;
  }
}

let enemies = makeEnemies(Enemy, `./assets/enemy1.png`, enemyCount);
// let enemies = makeEnemies(movementClass, enemyImg, enemyCount);

function makeEnemies(movementClass, imgSrc, count) {
  const enemyImg = new Image();
  enemyImg.src = imgSrc;
  return Array(count)
    .fill()
    .map(() => new movementClass(enemyImg, 6));
}

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

document.getElementById("movements")?.addEventListener("change", (e) => {
  /**
   *
   * @param {string} movement - random | sine | oscillatory | interval
   */
  function setMovement(movement) {
    switch (movement) {
      case "random":
        enemies = makeEnemies(Enemy, `./assets/enemy1.png`, enemyCount);

        break;

      case "sine":
        enemies = makeEnemies(SineEnemy, `./assets/enemy2.png`, enemyCount);
        break;

      case "oscillatory":
        enemies = makeEnemies(
          OscillatoryEnemy,
          `./assets/enemy3.png`,
          enemyCount
        );
        break;

      case "interval":
        enemies = makeEnemies(
          RandomIntervalMovementEnemy,
          `./assets/enemy4.png`,
          enemyCount
        );
        break;
    }
  }

  setMovement(e.target.value);
});
