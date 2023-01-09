"use strict";
const canvas = document.getElementById("#c");
const ctx = canvas.getContext("2d");
var AnimationName;
(function (AnimationName) {
    AnimationName["Idle"] = "idle";
    AnimationName["Jump"] = "jump";
    AnimationName["Fall"] = "fall";
    AnimationName["Run"] = "run";
    AnimationName["Dizzy"] = "dizzy";
    AnimationName["Sit"] = "sit";
    AnimationName["Roll"] = "roll";
    AnimationName["Bite"] = "bite";
    AnimationName["Dead"] = "dead";
    AnimationName["Hurt"] = "hurt";
})(AnimationName || (AnimationName = {}));
const CANVAS_WIDTH = (canvas.width = 600);
const CANVAS_HEIGHT = (canvas.height = 600);
const palyerSprite = new Image();
palyerSprite.src = "assets/shadow_dog.png";
let vectX = 0;
const drawParams = {
    sWidth: 575,
    sHeight: 523,
};
let gameFrame = 0;
// updating the animation frame after 10 render cycles
let staggerFrame = 10;
let playerState = AnimationName.Idle;
const animationStates = [
    {
        name: AnimationName.Idle,
        frames: 7,
    },
    {
        name: AnimationName.Jump,
        frames: 7,
    },
    {
        name: AnimationName.Fall,
        frames: 7,
    },
    {
        name: AnimationName.Run,
        frames: 9,
    },
    {
        name: AnimationName.Dizzy,
        frames: 11,
    },
    {
        name: AnimationName.Sit,
        frames: 5,
    },
    {
        name: AnimationName.Roll,
        frames: 7,
    },
    {
        name: AnimationName.Bite,
        frames: 7,
    },
    {
        name: AnimationName.Dead,
        frames: 12,
    },
    {
        name: AnimationName.Hurt,
        frames: 4,
    },
];
const spriteAnimations = setupSpriteAnimations(animationStates, drawParams);
function animate() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    let { sWidth, sHeight } = drawParams;
    const animationName = playerState;
    const data = spriteAnimations[animationName];
    let positionIndex = Math.floor(gameFrame / staggerFrame) % data.vector.length;
    const frameX = data.vector[positionIndex].x;
    const frameY = data.vector[positionIndex].y;
    ctx.drawImage(palyerSprite, frameX, frameY, sWidth, sHeight, 0, 0, sWidth, sHeight);
    gameFrame++;
    requestAnimationFrame(animate);
}
animate();

function setupSpriteAnimations(states, drawParams) {
    const spriteAnimations = {};
    states.forEach(({ name, frames }, idx) => {
        spriteAnimations[name] = {
            vector: [],
        };
        for (let i = 0; i < frames; i++) {
            const vector = {
                x: drawParams.sWidth * i,
                y: drawParams.sHeight * idx,
            };
            spriteAnimations[name].vector.push(vector);
        }
    });
    return spriteAnimations;
}
// event listener for dropdown
const dropdown = document.getElementById('animations')?.addEventListener('change', (e) => {
    //@ts-ignore
    playerState = e.target.value;
});
