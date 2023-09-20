import { Player } from "./src/player.mjs";
import { InputHandler } from "./src/input-handler.mjs";
import { drawShadowText } from "./src/utils.mjs";

window.addEventListener("load", (e) => {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const playerImg = document.getElementById("player_sprite");

  const CANVAS_WIDTH = (canvas.width = window.innerWidth);
  const CANVAS_HEIGHT = (canvas.height = window.innerHeight);

  const inputHandler = new InputHandler();
  const player = new Player(CANVAS_WIDTH, CANVAS_HEIGHT, playerImg);
  let prevTimeStamp = 0;

  function animate(timeStamp) {
    if (!timeStamp) {
      timeStamp = 0;
    }
    const deltaTime = timeStamp - prevTimeStamp;
    prevTimeStamp = timeStamp;
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    player.draw(ctx);
    player.update(inputHandler.lastKey, deltaTime);
    drawShadowText(ctx, {
      isAlignCenter: false,
      text: `Input ${inputHandler.lastKey}`,
      x: 20,
      y: 100,
    });

    drawShadowText(ctx, {
      isAlignCenter: false,
      text: `Current State ${player.currentState.state}`,
      x: 20,
      y: 150,
    });

    drawShadowText(ctx, {
      isAlignCenter: false,
      text: `FPS ${player.fps}`,
      x: CANVAS_WIDTH - 200,
      y: 150,
    });

    requestAnimationFrame(animate);
  }

  animate();
});
