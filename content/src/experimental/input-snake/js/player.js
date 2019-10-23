import Direction from "./Direction.js";

export default class Player {
  constructor(coord)
  {
    this.spawn = coord;
    this.coords = [coord];
    this.direction = Direction.random;
  }

  reset()
  {
    this.coords = [this.spawn];
  }
}
