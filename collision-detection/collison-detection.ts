/**
 * most simple form of collision detection which is between two axis alinged rectangles (without rotation)
 */

type Rectangle = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type Circle = {
  x: number;
  y: number;
  radius: number;
};

// checking not for collision is performant for this case, ignoring the touch case
function rectCollide(rect1: Rectangle, rect2: Rectangle): boolean {
  if (
    rect1.x + rect1.width <= rect2.x || // these check for all four cases where the rectangles
    rect2.x + rect2.width <= rect1.x || // can be above or below or trailing or ahead of each other
    rect1.y + rect1.height <= rect2.y ||
    rect2.y + rect2.height <= rect1.y
  ) {
    return false;
  } else {
    return true;
  }
}

function circleCollide(circle1: Circle, circle2: Circle): boolean {
  const dx = circle2.x - circle1.x;
  const dy = circle2.y - circle1.y;

  const d = Math.sqrt(dx * dx + dy * dy);

  if(d > circle1.radius + circle2.radius) {
    // no collision
    return false;
  }else if (d === circle1.radius + circle2.radius) {
    // touch
    return false;
  }else {
    // collision
    return true;
  }
}
