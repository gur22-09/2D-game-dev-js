import {
  FallingLeft,
  FallingRight,
  JumpingLeft,
  JumpingRight,
  RunningLeft,
  RunningRight,
  SittingLeft,
  SittingRight,
  StandingLeft,
  StandingRight,
} from "./state.mjs";
import { clamp } from "./utils.mjs";

export class Player {
  /**
   *
   * @param {number} gameWidth
   * @param {number} gameHeight
   * @param {HTMLImageElement} playerImg
   */
  constructor(gameWidth, gameHeight, playerImg) {
    this.gameHeight = gameHeight;
    this.gameWidth = gameWidth;
    this.states = [
      new StandingLeft(this),
      new StandingRight(this),
      new SittingLeft(this),
      new SittingRight(this),
      new RunningLeft(this),
      new RunningRight(this),
      new JumpingLeft(this),
      new JumpingRight(this),
      new FallingLeft(this),
      new FallingRight(this),
    ];
    this.currentState = this.states[1];
    this.image = playerImg;
    this.width = 200;
    this.height = 181.83;
    this.x = this.gameWidth * 0.5 - this.width * 0.5;
    this.y = this.gameHeight * 0.5 - this.height * 0.5;
    this.frameX = 0;
    this.frameY = 0;
    this.maxFrame = 6;
    this.speedX = 0;
    this.speedY = 0;
    this.gravity = 1;
    this.maxSpeed = 10;
    this.fps = 20;
    this.frameTimer = 0;
    this.frameInterval = 1000 / this.fps;
  }

  /**
   *
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    ctx.drawImage(
      this.image,
      this.frameX * this.width,
      this.frameY * this.height,
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
   * @param {string} lastKey
   */
  update(lastKey, deltaTime) {
    if (this.frameTimer > this.frameInterval) {
      this.frameX = (this.frameX % this.maxFrame) + 1;
      this.frameTimer = 0;
    } else {
      this.frameTimer += deltaTime;
    }

    this.currentState.handleInput(lastKey);
    this.x += this.speedX;
    this.y += this.speedY;

    this.x = clamp(this.x, 0, this.gameWidth - this.width);
    this.y = clamp(this.y, 0, this.gameHeight - this.height);

    if (!this.isOnGround()) {
      this.speedY += this.gravity;
    } else {
      this.speedY = 0;
    }
  }

  /**
   *
   * @param {number} state
   */
  setState(state) {
    this.currentState = this.states[state];
    this.currentState.enter();
  }
  
  /**
   * 
   * @returns {boolean}
   */
  isOnGround() {
    return this.y >= this.gameHeight - this.height;
  }
  
   /**
   * 
   * @returns {boolean}
   */
  isFallingDown() {
    return this.speedY > 0 && !this.isOnGround();
  }
}
