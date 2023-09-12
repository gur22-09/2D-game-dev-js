// todo
// 1. move classes outside
// 2.

/**
 * Represents draw params.
 * @typedef {Object} TextDrawParams
 * @property {number} x - The x-coordinate of the point.
 * @property {number} y - The y-coordinate of the point.
 * @property {boolean=} isAlignCenter
 * @property {string} text
 */

/**
 *
 * @param {["background", "enemy", "player"]} nameArr
 * @param {string} path
 * @param {Function} callback
 * @returns {Promise<Record<"background" | "enemy" | "player", string>>}
 */
async function loadImageAssets(nameArr, path) {
  return new Promise((resolve, reject) => {
    if (!nameArr || !path) {
      reject("missing arguments");
    }
    let count = nameArr.length;
    let results = {};

    for (let name of nameArr) {
      const img = new Image();
      img.src = `${path}/${name}.png`;

      results[name] = img;

      img.onload = () => {
        if (--count === 0) {
          resolve(results);
        }
      };
    }
  });
}

/**
 *
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns
 */
function clamp(value, min, max) {
  return Math.max(Math.min(value, max), min);
}

/**
 *
 * @param {number} base
 * @param {number} spread
 * @returns
 */
function getBoundedRandom(base, spread) {
  return Math.random() * base + spread;
}

/**
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {TextDrawParams} drawParams
 */
function drawShadowText(ctx, drawParams) {
  const { text, x, y, isAlignCenter = false } = drawParams;
  if (isAlignCenter) {
    ctx.textAlign = "center";
  } else {
    ctx.textAlign = "left";
  }

  ctx.fillStyle = "#000";
  ctx.font = `40px Helvetica`;
  ctx.fillText(text, x, y);
  ctx.fillStyle = "#fff";
  ctx.fillText(text, x + 2, y + 2);
}

window.addEventListener("load", () => {
  const canvas = document.getElementById("c");
  const ctx = canvas.getContext("2d");

  const CANVAS_WIDTH = (canvas.width = 1080);
  const CANVAS_HEIGHT = (canvas.height = 720);

  const enemies = [];
  let prevTimeStamp = 0;
  let enemyTimer = 0;
  const enemyInterval = 2000;
  let randomEnemyInterval = getBoundedRandom(1000, 500);
  let gameScore = 0;
  let isGameOver = false;

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
            // console.log(this.#keys);
            break;
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
            // console.log(this.#keys);
            break;
          }

          default:
            break;
        }
      });
    }

    get keys() {
      return this.#keys;
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
      this.width = 200;
      this.height = 200;
      this.x = 0;
      this.y = this.gameHeight - this.height;
      this.playerImg = playerImg;
      this.frameX = 0;
      this.runningFrames = 8;
      this.jumpFrames = 5;
      this.maxFrame = this.runningFrames;
      this.fps = 20;
      this.frameTimer = 0;
      this.frameInterval = 1000 / this.fps; // time take to render 1 frame in milli seconds
      this.frameY = 0;
      this.speedX = 0;
      this.speedY = 0;
      this.gravity = 1;
    }

    /**
     *
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
      ctx.strokeStyle = "#000";
      ctx.beginPath();
      ctx.arc(
        this.x + this.width / 2,
        this.y + this.height / 2,
        this.width / 2,
        0,
        Math.PI * 2
      );
      ctx.stroke();
      ctx.drawImage(
        this.playerImg,
        this.width * this.frameX,
        this.height * this.frameY,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }

    /**
     *
     * @param {InputHandler} input
     * @param {number} deltaTime
     */
    update(input, deltaTime) {
      if (this.frameTimer > this.frameInterval) {
        this.frameX = (this.frameX + 1) % this.maxFrame;
        this.frameTimer = 0;
      } else {
        this.frameTimer += deltaTime;
      }

      if (input.keys.includes("ArrowRight")) {
        this.speedX = 5;
      } else if (input.keys.includes("ArrowLeft")) {
        this.speedX = -5;
      } else if (input.keys.includes("ArrowUp") && this.isOnGround()) {
        // isOnGround to keep only sinlge jump, remove it to allow multiple jumps
        this.speedY = -30;
      } else {
        this.speedX = 0;
      }

      this.x += this.speedX;
      this.y += this.speedY;

      if (!this.isOnGround()) {
        this.speedY += this.gravity;
        this.maxFrame = this.jumpFrames;
        this.frameY = 1;
      } else {
        this.maxFrame = this.runningFrames;
        this.speedY = 0;
        this.frameY = 0;
      }

      this.x = clamp(this.x, 0, this.gameWidth - this.width);
      this.y = clamp(this.y, 0, this.gameHeight - this.height);
    }

    isOnGround() {
      return this.y >= this.gameHeight - this.height;
    }

    /**
     *
     * @param {Enemy} enemy
     */
    collidesWith(enemy) {
      const dx = (enemy.x + enemy.width / 2) - (this.x + this.width / 2);
      const dy = (enemy.y + enemy.height / 2) - (this.y + this.height / 2);

      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < enemy.width / 2 + this.width / 2) {
        isGameOver = true;
      }
    }
  }

  // Enemy Class
  class Enemy {
    constructor(gameWidth, gameHeight, enemyImg) {
      this.gameWidth = gameWidth;
      this.gameHeight = gameHeight;
      this.width = 160;
      this.height = 119;
      this.x = this.gameWidth;
      this.y = this.gameHeight - this.height;
      this.img = enemyImg;
      this.frameX = 0;
      this.speedX = 8;
      this.maxFrame = 5;
      this.fps = 20;
      this.frameTimer = 0;
      this.frameInterval = 1000 / this.fps; // time take to render 1 frame in milli seconds
      this.destroy = false;
    }

    /**
     *
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
      ctx.strokeStyle = "#000";
      ctx.beginPath();
      ctx.arc(
        this.x + this.width / 2,
        this.y + this.width / 2,
        this.width / 2,
        0,
        Math.PI * 2
      );
      ctx.stroke();
      ctx.strokeStyle = "blue";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.drawImage(
        this.img,
        this.frameX * this.width,
        0,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }

    /**
     *
     * @param {number} deltaTime // in milli seconds
     */
    update(deltaTime) {
      if (this.frameTimer > this.frameInterval) {
        this.frameX = (this.frameX + 1) % this.maxFrame;
        this.frameTimer = 0;
      } else {
        this.frameTimer += deltaTime;
      }
      this.x -= this.speedX;

      if (this.x < 0 - this.width) {
        this.destroy = true;
        gameScore++;
      }
    }
  }

  // Backgrounds
  class Background {
    /**
     *
     * @param {number} gameWidth
     * @param {number} gameHeight
     * @param {number} width
     * @param {number} height
     * @param {HTMLImageElement} bgImg
     */
    constructor(gameWidth, gameHeight, bgImg) {
      this.gameWidth = gameWidth;
      this.gameHeight = gameHeight;
      this.img = bgImg;
      this.x = 0;
      this.y = 0;
      this.width = 2400;
      this.height = 720;
      this.speed = 7;
    }

    /**
     *
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
      ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
      ctx.drawImage(
        this.img,
        this.x + this.width,
        this.y,
        this.width,
        this.height
      );
    }

    update() {
      this.x -= this.speed;
      if (this.x <= -this.width) {
        this.x = 0;
      }
    }
  }

  loadImageAssets(["background", "enemy", "player"], "./assets")
    .then((res) => {
      runGame(res);
    })
    .catch((err) => console.error(err));

  /**
   *
   * @param {Enemy[]} enemies
   * @param {number} deltaTime
   */
  function addEnemies(enemies, deltaTime, enemyImg) {
    if (enemyTimer > enemyInterval + randomEnemyInterval) {
      enemies.push(new Enemy(CANVAS_WIDTH, CANVAS_HEIGHT, enemyImg));
      // reset timer
      enemyTimer = 0;
      randomEnemyInterval = getBoundedRandom(1000, 500);
    } else {
      enemyTimer += deltaTime;
    }
  }

  /**
   *
   * @param {Record<"background" | "enemy" | "player", HTMLImageElement>} assets
   */
  function runGame(assets) {
    const playerImg = assets.player;
    const enemyImg = assets.enemy;
    const backgroundImg = assets.background;

    const inputHandler = new InputHandler();
    const player = new Player(CANVAS_WIDTH, CANVAS_HEIGHT, playerImg);
    const backgrounds = [
      new Background(CANVAS_WIDTH, CANVAS_HEIGHT, backgroundImg),
    ];

    enemies.push(new Enemy(CANVAS_WIDTH, CANVAS_HEIGHT, enemyImg));

    animate(ctx, player, enemies, backgrounds, inputHandler, assets, 0);
  }

  /**
   *
   * @param {Player} player
   * @param {Enemy[]} enemies
   */
  function checkCollision(player, enemies) {
    for (const enemy of enemies) {
      if (player.collidesWith(enemy)) {
        gameOver = true;
      }
    }
  }

  /**
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {Player} player
   * @param {Enemy[]} enemies
   * @param {Background[]} backgrounds
   * @param {InputHandler} inputHandler
   * @param {Record<"background" | "enemy" | "player", HTMLImageElement>} assets
   * @param {number} timeStamp
   */
  function animate(
    ctx,
    player,
    enemies,
    backgrounds,
    inputHandler,
    assets,
    timeStamp
  ) {
    const deltaTime = (timeStamp ?? 0) - prevTimeStamp;
    prevTimeStamp = timeStamp;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    backgrounds.forEach((b) => {
      b.draw(ctx);
      // b.update();
    });

    player.draw(ctx);
    player.update(inputHandler, deltaTime);
    checkCollision(player, enemies);

    addEnemies(enemies, deltaTime, assets.enemy);

    enemies = enemies.filter((e) => !e.destroy);

    enemies.forEach((e) => {
      e.draw(ctx);
      e.update(deltaTime);
    });

    drawShadowText(ctx, {
      text: `Score: ${gameScore}`,
      x: 20,
      y: 50,
    });

    if (!isGameOver) {
      requestAnimationFrame((stamp) =>
        animate(ctx, player, enemies, backgrounds, inputHandler, assets, stamp)
      );
    } else {
      drawShadowText(ctx, {
        text: `Game Over!`,
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        isAlignCenter: true,
      });
    }
  }
});
