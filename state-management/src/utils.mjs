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
 * @param {CanvasRenderingContext2D} ctx 
 * @param {TextDrawParams} drawParams 
 */
export function drawShadowText(ctx, drawParams) {
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

/**
 *
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns
 */
export function clamp(value, min, max) {
  return Math.max(Math.min(value, max), min);
}
