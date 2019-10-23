export default class Coord {
  constructor(x, y)
  {
    this.x = x;
    this.y = y;
  }

  clone()
  {
    return new Coord(this.x, this.y);
  }
}
