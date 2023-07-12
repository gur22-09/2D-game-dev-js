const canvas = document.getElementById('#c');
const ctx = canvas.getContext('2d');

const CANVAS_WIDTH = canvas.width = 800;
const CANVAS_HEIGHT = canvas.height = 700;

let gameSpeed = 10;

const bgLayer1 = new Image();
bgLayer1.src = `assets/layer-1.png`;

const bgLayer2 = new Image();
bgLayer2.src = `assets/layer-2.png`;;

const bgLayer3 = new Image();
bgLayer3.src = `assets/layer-3.png`;;

const bgLayer4 = new Image();
bgLayer4.src = `assets/layer-4.png`;;

const bgLayer5 = new Image();
bgLayer5.src = `assets/layer-5.png`;;

let x = 0;
let x2 = 2400;
let stop = false;

function animate() {
  if(stop) return;
    
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);  
  ctx.drawImage(bgLayer4, x, 0);
 
  
  
  x -= gameSpeed;  
  console.log(x);
  if(x <= -2400) {
    // console.log('reached');
    ctx.drawImage(bgLayer4, 0, 0);
    stop = true;
  }

//   if(x2 < -2400) {
//     x2 = 2400
//   }else {
//     x2 -= gameSpeed;
//   }
  
  requestAnimationFrame(animate);  
}

animate();