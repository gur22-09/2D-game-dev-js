/**
 * Represents draw params.
 * @typedef {Object} TextDrawParams
 * @property {number} x - The x-coordinate of the point.
 * @property {number} y - The y-coordinate of the point.
 * @property {boolean=} isAlignCenter
 * @property {string} text
 */

class Game {
  /**
   *
   * @param {number} gameWidth
   * @param {number} gameHeight
   * @param {Enemy[]} enemies
   */
  constructor(ctx, gameWidth, gameHeight, enemies) {
    this.ctx = ctx;
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.enemies = enemies;
    this.assets = null;
  }

  async init() {
    this.assets = await AssetManager.loadAssets(
      ["background", "enemy", "player"],
      "assets"
    );
  }

  /**
   *
   *
   * @param {Function} animate
   */
  runGame(animate) {
    if (this.assets === null) return;

    const playerImg = this.assets.player;
    const enemyImg = this.assets.enemy;
    const backgroundImg = this.assets.background;

    const inputHandler = new InputHandler();
    const player = new Player(this.gameWidth, this.gameHeight, playerImg);
    const backgrounds = [
      new Background(this.gameWidth, this.gameHeight, backgroundImg),
    ];

    this.enemies.push(new Enemy(this.gameWidth, this.gameHeight, enemyImg));

    animate(
      this.ctx,
      player,
      this.enemies,
      backgrounds,
      inputHandler,
      this.assets,
      0
    );
  }

  reset() {
    this.enemies = [];
  }
}

class AssetManager {
  /**
   *
   * @param {["background", "enemy", "player"]} nameArr
   * @param {string} path
   * @returns {Promise<Record<"background" | "enemy" | "player", string>>}
   */
  static loadAssets(nameArr, path) {
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
}

class InputHandler {
  #keys = [];
  #touchEvents = [];
  touchThreshold = 30;
  pageY = 0;

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

    window.addEventListener("touchstart", (e) => {
      this.pageY = e.touches[0].pageY;
    });

    window.addEventListener("touchmove", (e) => {
      const swipeDistance = e.touches[0].pageY - this.pageY;
      if (
        swipeDistance < -this.touchThreshold &&
        !this.#touchEvents.includes("SwipeUp")
      ) {
        this.#touchEvents.push("SwipeUp");
      } else if (
        swipeDistance > this.touchThreshold &&
        !this.#touchEvents.includes("SwipeDown")
      ) {
        this.#touchEvents.push("SwipeDown");
      }
    });

    window.addEventListener("touchend", () => {
      this.#touchEvents.length = 0;
    });
  }

  get keys() {
    return this.#keys;
  }

  get touchEvents() {
    return this.#touchEvents;
  }
}

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
   * @param {Enemy[]} enemies
   * @param {Function} onGameOver
   */
  update(input, deltaTime, enemies, onGameOver) {
    checkCollision(this, enemies, onGameOver);

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
    } else if (
      (input.keys.includes("ArrowUp") ||
        input.touchEvents.includes("SwipeUp")) &&
      this.isOnGround()
    ) {
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
    const dx = enemy.x + enemy.width / 2 - (this.x + this.width / 2);
    const dy = enemy.y + enemy.height / 2 - (this.y + this.height / 2);

    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance + 15 < enemy.width / 2 + this.width / 2) {
      return true;
    }

    return false;
  }
}

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
    // ctx.strokeStyle = "white";
    // ctx.beginPath();
    // ctx.arc(this.x + this.width / 2 , this.y + this.height / 2, this.width / 2 - 20, 0, 2 * Math.PI);
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
   * @param {number} updateScore
   */
  update(deltaTime, updateScore) {
    if (this.frameTimer > this.frameInterval) {
      this.frameX = (this.frameX + 1) % this.maxFrame;
      this.frameTimer = 0;
    } else {
      this.frameTimer += deltaTime;
    }

    this.x -= this.speedX;

    if (this.x < 0 - this.width) {
      this.destroy = true;
      updateScore();
    }
  }
}

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
 * @param {Player} player
 * @param {Enemy[]} enemies
 * @param {Function} onGameOver
 */
function checkCollision(player, enemies, onGameOver) {
  for (const enemy of enemies) {
    if (player.collidesWith(enemy)) {
      onGameOver();
    }
  }
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
  const retryBtn = document.getElementById("reset");
  const fullScreenBtn = document.getElementById("fullScreenToggle");

  const CANVAS_WIDTH = (canvas.width = 1080);
  const CANVAS_HEIGHT = (canvas.height = 720);

  let enemies = [];
  let prevTimeStamp = 0;
  let enemyTimer = 0;
  const enemyInterval = 2000;
  let randomEnemyInterval = getBoundedRandom(1000, 500);
  let gameScore = 0;
  let isGameOver = false;
  const game = new Game(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, enemies);

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
      b.update();
    });

    player.draw(ctx);
    player.update(inputHandler, deltaTime, enemies, onGameOver);

    addEnemies(enemies, deltaTime, assets.enemy);

    enemies = enemies.filter((e) => !e.destroy);

    enemies.forEach((e) => {
      e.draw(ctx);
      e.update(deltaTime, () => {
        gameScore++; // TODO - refacor using state management
      });
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
        text: `Game Over! Press Enter to restart`,
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        isAlignCenter: true,
      });
    }
  }

  function onGameOver() {
    isGameOver = true;
    retryBtn.style.opacity = 1;
  }

  function reset() {
    isGameOver = false;
    gameScore = 0;
    enemies = [];
    game.reset();
  }

  function retryGame() {
    reset();
    game.runGame(animate);
  }

  function toggleFullScreen() {
    if(!document.fullscreenElement) {
      canvas.requestFullscreen().catch(e => alert(`FullScreen failed ${e.message}`))
    }else {
      document.exitFullscreen();
    }
  }

  async function startGame() {
    await game.init();
    game.runGame(animate);
  }

  startGame();

  retryBtn.addEventListener("click", () => {
    retryGame();
    retryBtn.style.opacity = 0;
  });

  fullScreenBtn.addEventListener("click", () => {
    toggleFullScreen();
  })

  window.addEventListener("keypress", (e) => {
    switch (e.key) {
      case "Enter":
        if (!isGameOver) return;
        retryBtn.style.opacity = 0;
        retryGame();
    }
  });
});
