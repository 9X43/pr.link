import Coord from "./coord.js";

export default class Board {
  constructor(root_node)
  {
    this.root_node = root_node;
    this.checkbox_size = this.getCheckboxSize();

    this.width = this.root_node.clientWidth;
    this.height = this.root_node.clientHeight;
    this.cols = Math.floor(this.width / this.checkbox_size.width);
    this.rows = Math.floor(this.height / this.checkbox_size.height);

    this.spawn = new Coord(Math.round(this.cols / 2), Math.round(this.rows / 2));

    // Fill board
    for (let y = 0; y < this.rows; ++y) {
      for (let x = 0; x < this.cols; ++x) {
        this.spawnInput("checkbox", x, y);
      }
    }

    this.init();
  }

  init()
  {
    this.pickup_count = 0;
    this.spawnPickup();
  }

  getCheckboxSize()
  {
    const checkbox = document.createElement("input");
    checkbox.setAttribute("type", "checkbox");
    this.root_node.appendChild(checkbox);

    const rect = checkbox.getBoundingClientRect();
    checkbox.parentNode.removeChild(checkbox);

    return rect;
  }

  spawnPickup()
  {
    if (this.pickup_count !== 0 && Math.random() > .8)
      return;

    this.pickup_count++;

    let pickup_coords;
    let input;

    do {
      pickup_coords = new Coord(
        Math.floor(Math.random() * this.cols),
        Math.floor(Math.random() * this.rows)
      );
      input = this.getInput(pickup_coords);
    } while(input.getAttribute("checked") !== null);

    input.setAttribute("type", "radio");
    input.setAttribute("checked", "checked");

    if (this.pickup_count < 2 && Math.random() > .8)
      this.spawnPickup();
  }

  spawnInput(type, x, y)
  {
    const node = document.createElement("input");
    node.setAttribute("type", type);
    node.setAttribute("class", this.getInputId(x, y));
    this.root_node.appendChild(node);
  }

  getInputId(x, y)
  {
    return `x${x}_y${y}`;
  }

  getInput(coords)
  {
    return this.root_node.querySelector("." + this.getInputId(coords.x, coords.y));
  }

  uncheckInput(coords)
  {
    this.getInput(coords).removeAttribute("checked");
  }

  checkInput(coords)
  {
    this.getInput(coords).setAttribute("checked", "checked");
  }

  setInputType(coords, type)
  {
    this.getInput(coords).setAttribute("type", type);
  }

  reset(callback, step = 0)
  {
    if (step < this.rows) {  // Fill board
      for(let col = 0; col < this.cols; ++col) {
        this.checkInput(new Coord(col, step));
        this.setInputType(new Coord(col, step), "checkbox");
      }

      setTimeout(() => {
        this.reset(callback, ++step);
      }, 10);
    } else if(step < this.rows * 2) {  // Clear board
      const y = step - (this.rows);
      for(let x = 0; x < this.cols; ++x) {
        this.uncheckInput(new Coord(x, y));
      }

      setTimeout(() => {
        this.reset(callback, ++step);
      }, 10);
    } else {  // Start again
      this.init();
      callback();
    }
  }
}
