console.log("linked");

// todo
// 1. move classes outside
// 2.

/**
 *
 * @param {string[]} nameArr
 * @param {string} path
 * @param {Function} callback
 */
function loadImageAssets(nameArr, path, callback) {
  let count = nameArr.length;
  let results = {};

  for (let name of nameArr) {
    const img = new Image();
    img.src = `${path}/${name}.png`;

    results[name] = img;

    img.onload = () => {
      if (--count === 0) {
        callback(results);
      }
    };
  }

  return results;
}

window.addEventListener("load", () => {
  const canvas = document.getElementById("c");
  const ctx = canvas.getContext("2d");

  const CANVAS_WIDTH = (canvas.width = 1080);
  const CANVAS_HEIGHT = (canvas.height = 720);

  // Input Handler
  class InputHandler {
    #keys = [];

    constructor() {
      window.addEventListener("keydown", (e) => {
        switch (e.key) {
          case "ArrowDown":
          case "ArrowUp":
          case "ArrowLeft":
          case "ArrowRight": {
            if (this.#keys.includes(e.key)) return;
            this.#keys.push(e.key);
            console.log(this.#keys);
            break;
          }

          case "Enter": {
            console.log("Enter Pressed");
          }

          default:
            break;
        }
      });

      window.addEventListener("keyup", (e) => {
        switch (e.key) {
          case "ArrowDown":
          case "ArrowUp":
          case "ArrowLeft":
          case "ArrowRight": {
            const index = this.#keys.findIndex((k) => k === e.key);
            if (index === -1) return;

            this.#keys.splice(index, 1);
            console.log(this.#keys);
            break;
          }

          case "Enter": {
            console.log("Enter Pressed");
          }

          default:
            break;
        }
      });
    }
  }

  // Player Class
  class Player {
    /**
     *
     * @param {Number} gameWidth
     * @param {Number} gameHeight
     * @param {HTMLImageElement} playerImg
     */
    constructor(gameWidth, gameHeight, playerImg) {
      this.gameWidth = gameWidth;
      this.gameHeight = gameHeight;
      this.x = 0;
      this.y = 0;
      this.spriteWidth = 200;
      this.spriteHeight = 200;
      this.playerImg = playerImg;
    }

    /**
     *
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
      ctx.fillStyle = "#fff";
      ctx.fillRect(this.x, this.y, this.spriteWidth, this.spriteHeight);
      ctx.drawImage(this.playerImg, 0, 0);
    }

    update() {
      this.x++;
    }
  }

  // Enemy Class

  // Backgrounds

  loadImageAssets(["background", "enemy", "player"], "./assets", runGame);

  /**
   *
   * @param {Record<string, HTMLImageElement>} assets
   */
  function runGame(assets) {
    const playerImg = assets.player;
    const enemyImg = assets.enemy;
    const backgroundImg = assets.background;

    const inputHandler = new InputHandler();
    const player = new Player(CANVAS_WIDTH, CANVAS_HEIGHT, playerImg);

    animate(ctx, player);
  }

  function animate(ctx, player) {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    player.draw(ctx);
    player.update();

    requestAnimationFrame(() => animate(ctx, player));
  }
});
