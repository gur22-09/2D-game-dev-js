const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

const collisionCanvas = document.getElementById("collision");
const collisionCtx = collisionCanvas.getContext("2d", {
  willReadFrequently: true,
});

const resetBtn = document.getElementById("reset");

const CANVAS_WIDTH =
  ((canvas.width = window.innerWidth),
  (collisionCanvas.width = window.innerWidth));
const CANVAS_HEIGHT =
  ((canvas.height = window.innerHeight),
  (collisionCanvas.height = window.innerHeight));
const enemyInterval = 500;
const bgImage = new Image();
bgImage.src = "./assets/background.png";

let gameScore = 0;
let isGameOver = false;

const floor = (n) => Math.floor(n);

class Raven {
  constructor(imgSrc) {
    this.spriteWidth = 271;
    this.spriteHeight = 194;
    this.sizeModifier = Math.random() * 0.6 + 0.4;
    this.width = this.spriteWidth * this.sizeModifier;
    this.height = this.spriteHeight * this.sizeModifier;
    this.frame = 0;
    this.maxFrame = 5;
    this.x = CANVAS_WIDTH;
    this.y = Math.random() * (CANVAS_HEIGHT - this.height);
    this.speed = [Math.random() * 5 + 3, Math.random() * 5 - 2.5];
    this.destroy = false;
    this.img = new Image();
    this.img.src = imgSrc;
    this.flapInterval = Math.random() * 100 + 50;
    this.lastFlapTime = 0;
    this.colorArr = [
      floor(Math.random() * 255),
      floor(Math.random() * 255),
      floor(Math.random() * 255),
    ];
    this.color = `rgb(${this.colorArr[0]}, ${this.colorArr[1]}, ${this.colorArr[2]})`;
  }

  update(deltaTime) {
    if (this.x < -this.width) {
      this.destroy = true;
      isGameOver = true;
    }

    if (this.y < 0 || this.y > CANVAS_HEIGHT - this.height) {
      this.speed[1] = -this.speed[1];
    }

    this.lastFlapTime += deltaTime;

    if (this.lastFlapTime > this.flapInterval) {
      if (this.frame >= this.maxFrame) this.frame = 0;
      else this.frame++;
      this.lastFlapTime = 0;
    }

    let [speedX, speedY] = this.speed;
    this.x -= speedX;
    this.y -= speedY;
  }

  draw() {
    collisionCtx.fillStyle = this.color;
    collisionCtx.fillRect(this.x, this.y, this.width, this.height);
    ctx.drawImage(
      this.img,
      this.frame * this.spriteWidth,
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

class Explosion {
  constructor(x, y, size, imgSrc, soundSrc) {
    this.spriteWidth = 200;
    this.spriteHeight = 179;
    this.maxFrame = 5;
    this.x = x;
    this.y = y;
    this.size = size;
    this.image = new Image();
    this.image.src = imgSrc;
    this.audio = new Audio(soundSrc);
    this.timeSinceLastFrame = 0;
    this.frameInterval = 100;
    this.frame = 0;
    this.destroy = false;
  }

  update(deltaTime) {
    if (this.frame === 0) this.audio.play();

    this.timeSinceLastFrame += deltaTime;

    if (this.timeSinceLastFrame > this.frameInterval) {
      this.frame++;
      this.timeSinceLastFrame = 0;
      // if (this.frame >= this.maxFrame) this.destroy = true;
    }
  }

  draw() {
    ctx.drawImage(
      this.image,
      this.spriteWidth * this.frame,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y - this.size * 0.25,
      this.size,
      this.size
    );
  }
}

let ravens = [];
let explosions = [];
let prevStamp = 0;
let timeToNextRaven = 0;

/**
 *
 * @param {milliseconds (double)} timeStamp
 */
function animate(timeStamp) {
  if (timeStamp === undefined) {
    timeStamp = 0;
  }

  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.drawImage(bgImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  collisionCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const deltaTime = timeStamp - prevStamp;

  prevStamp = timeStamp;

  timeToNextRaven += deltaTime;

  if (timeToNextRaven > enemyInterval && ravens.length < 100) {
    ravens.push(new Raven("./assets/raven.png"));
    ravens.sort((a, b) => a.width - b.width);
    timeToNextRaven = 0;
  }

  

  ravens.forEach((r) => {
    r.update(deltaTime);
    r.draw();
  });
  explosions.forEach((e) => {
    e.update(deltaTime);
    e.draw();
  });

  ravens = ravens.filter((r) => !r.destroy);
  explosions = explosions.filter((e) => !e.destroy);
  
  drawShadowText(`Score : ${gameScore}`, 50, 75);

  if (!isGameOver) {
    requestAnimationFrame(animate);
  } else {
    handleGameOver();
  }
}


function handleGameOver() {
  drawShadowText(
    `Game Over!, your score ${gameScore}`,
    CANVAS_WIDTH / 2,
    CANVAS_HEIGHT / 2,
    true
  );
  resetBtn.style.opacity = 1;
}

function drawGameOver() {
  ctx.fillStyle = "black";
  ctx.font = "50px Impact";
  ctx.fillText("Score: " + gameScore, 50, 75);
  ctx.fillStyle = "white";
  ctx.fillText("Score: " + gameScore, 55, 80);
}

function drawShadowText(text, x, y, isCenter = false) {
  if(isCenter) {
    ctx.textAlign = "center";
  }else {
    ctx.textAlign = "left";
  }

  ctx.fillStyle = "black";
  ctx.font = `50px Impact`;
  ctx.fillText(text, x, y);
  ctx.fillStyle = "white";
  ctx.fillText(text, x + 5, y + 5);
}

function reset() {
  isGameOver = false;
  gameScore = 0;
  explosions = [];
  ravens = [];
  animate();
}

// click listener
window.addEventListener("click", (e) => {
  const { x, y } = e;
  const data = collisionCtx.getImageData(x, y, 1, 1).data;

  // if color pixels match, then it means a succesful collision
  ravens.forEach((raven) => {
    if (
      raven.colorArr[0] === data[0] &&
      raven.colorArr[1] === data[1] &&
      raven.colorArr[2] === data[2]
    ) {
      raven.destroy = true;
      gameScore++;
      explosions.push(
        new Explosion(
          raven.x,
          raven.y,
          raven.width,
          "./assets/boom.png",
          "./assets/explosion.wav"
        )
      );
    }
  });
});

resetBtn.addEventListener("click", () => {
  resetBtn.style.opacity = 0;
  reset();
  animate();
});

animate();
