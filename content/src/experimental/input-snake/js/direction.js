export default class Direction {
  static get up() { return Direction.dirs.up; }
  static get right() { return Direction.dirs.right; }
  static get down() { return Direction.dirs.down; }
  static get left() { return Direction.dirs.left; }

  static get random()
  {
    return Math.floor(Math.random() * Object.keys(Direction.dirs).length);
  }
}

Direction.dirs = Object.freeze({
  up: 0,
  right: 1,
  down: 2,
  left: 3
});
