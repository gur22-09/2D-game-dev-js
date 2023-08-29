const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

const CANVAS_WIDTH = (canvas.width = 1000);
const CANVAS_HEIGHT = (canvas.height = 500);

class Explosion {
  constructor(x, y, imgSrc, audioSrc, spriteLen) {
    this.frame = 0;
    this.spriteWidth = 200;
    this.spriteHeight = 179;
    this.width = this.spriteWidth / 2;
    this.height = this.spriteHeight / 2;
    this.x = x - this.width / 2;
    this.y = y - this.height / 2;
    this.staggerFrame = 10;
    this.img = new Image();
    this.img.src = imgSrc;
    this.positionIndex = 0;
    this.spriteLen = spriteLen;
    this.destroy = false;
    this.audio = new Audio();
    this.audio.src = audioSrc;
  }

  shouldRemove() {
    return this.destroy;
  }

  update() {
    if (this.positionIndex === 0) this.audio.play();
    if (this.positionIndex === this.spriteLen - 1) {
      this.destroy = true;
    }
    this.positionIndex =
      Math.floor(this.frame / this.staggerFrame) % this.spriteLen;
    this.frame++;
  }

  draw() {
    ctx.drawImage(
      this.img,
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

const explosions = [];

function animate() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  explosions.forEach((e, idx, arr) => {
    e.draw();
    e.update();
    if (e.shouldRemove()) {
      arr.splice(idx, 1);
    }
  });

  requestAnimationFrame(animate);
}

animate();

function createExplosion(x, y) {
  explosions.push(
    new Explosion(x, y, "./assets/boom.png", "./assets/explosion.wav", 5)
  );
}

// click listener
window.addEventListener("click", (e) => {
  if(e.target !== canvas) return;
  
  const { offsetX, offsetY } = e;
  createExplosion(offsetX, offsetY);
});
