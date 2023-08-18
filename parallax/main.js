const canvas = document.getElementById("#c");
const ctx = canvas.getContext("2d");

const CANVAS_WIDTH = (canvas.width = 1000);
const CANVAS_HEIGHT = (canvas.height = 700);

let gameSpeed = 5;

const slider = document.getElementById("slider");
slider.value = gameSpeed;

const gameSpeedText = document.querySelector(".speed");
gameSpeedText.innerHTML = `Game Speed: ${gameSpeed}`;

slider.addEventListener("change", (e) => {
  const newSpeed = e.target.value;
   gameSpeedText.innerHTML = `Game Speed: ${newSpeed}`;
  gameSpeed = newSpeed;
 
});

const bgLayer1 = new Image();
bgLayer1.src = `assets/layer-1.png`;

const bgLayer2 = new Image();
bgLayer2.src = `assets/layer-2.png`;

const bgLayer3 = new Image();
bgLayer3.src = `assets/layer-3.png`;

const bgLayer4 = new Image();
bgLayer4.src = `assets/layer-4.png`;

const bgLayer5 = new Image();
bgLayer5.src = `assets/layer-5.png`;

class BgLayer {
  // speedModifier is for offestting the speed (0, 1]
  constructor(ctx, image, speedMoifier) {
    this.x = 0;
    this.y = 0;
    this.width = 2400;
    this.height = CANVAS_HEIGHT;
    this.ctx = ctx;
    this.image = image;
    this.speedMoifier = speedMoifier;
  }

  update() {
    const speed = gameSpeed * this.speedMoifier;
    if (this.x <= -this.width) {
      this.x = 0;
    }

    this.x = this.x - speed;
  }

  draw() {
    this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    this.ctx.drawImage(
      this.image,
      this.x + this.width,
      this.y,
      this.width,
      this.height
    );
  }
}

const layer1 = new BgLayer(ctx, bgLayer1, 0.4);
const layer2 = new BgLayer(ctx, bgLayer2, 0.5);
const layer3 = new BgLayer(ctx, bgLayer3, 0.6);
const layer4 = new BgLayer(ctx, bgLayer4, 0.8);
const layer5 = new BgLayer(ctx, bgLayer5, 1);

const layerList = [layer1, layer2, layer3, layer4, layer5];

function animate() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  layerList.forEach((layer) => {
    layer.draw();
    layer.update();
  });

  requestAnimationFrame(animate);
}

animate();
