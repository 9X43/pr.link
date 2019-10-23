import Board from "./board.js";
import Player from "./player.js";
import Coord from "./coord.js";
import Direction from "./direction.js";

export default class InputSnake {
  constructor(root_node)
  {
    // Defaults
    this.default = {
      frame_time: 100,
      min_frame_time: 45
    };

    // Setup
    this.board = new Board(root_node);
    this.player = new Player(new Coord(this.board.spawn.x, this.board.spawn.y));

    // Events
    window.addEventListener("keydown", this.handleInput.bind(this), false);
    this.accept_input = true;

    // Start
    this.frame_time = this.default.frame_time;
    this.loop_start_timestamp = false;
    this.loop = window.requestAnimationFrame(this.frame.bind(this));
  }

  start()
  {
    if (!this.loop) {
      this.accept_input = true;
      this.loop = window.requestAnimationFrame(this.frame.bind(this));
    }
  }

  pause(force = false)
  {
    if (force)
      this.accept_input = false;

    if (this.loop) {
      window.cancelAnimationFrame(this.loop);
      this.loop = false;
      this.loop_start_timestamp = false;
    }
  }

  reset()
  {
    this.pause(true);
    this.board.reset(() => {
      this.frame_time = this.default.frame_time;
      this.player.reset();
      this.start();
    });
  }

  frame(timestamp)
  {
    if (!this.loop_start_timestamp)
      this.loop_start_timestamp = timestamp;

    if (timestamp - this.loop_start_timestamp > this.frame_time) {
      this.movePlayer();
      this.loop_start_timestamp = timestamp;
    }

    if (this.loop)
      this.loop = window.requestAnimationFrame(this.frame.bind(this));
  }

  movePlayer()
  {
    const head = this.player.coords[this.player.coords.length - 1].clone();

    // Set new coords
    switch (this.player.direction) {
      case Direction.right:
        ++head.x;
        if (head.x > this.board.cols - 1)
          head.x = 0;
        break;
      case Direction.left:
        --head.x;
        if (head.x < 0)
          head.x = this.board.cols - 1;
        break;
      case Direction.up:
        --head.y;
        if (head.y < 0)
          head.y = this.board.rows - 1;
        break;
      case Direction.down:
        ++head.y;
        if (head.y > this.board.rows - 1)
          head.y = 0;
        break;
      default:
        break;
    }

    const next_input = this.board.getInput(head);

    if (next_input.type !== "radio") {  // Regular cell
      if (next_input.getAttribute("checked") !== null) {
        this.reset();
        return;
      }

      const tail = this.player.coords.shift();
      this.board.uncheckInput(tail);
    } else {  // Pickup
      if (this.frame_time > this.default.min_frame_time)
        --this.frame_time;
      this.board.setInputType(head, "checkbox");
      this.board.pickup_count--;
      this.board.spawnPickup();
    }

    this.player.coords.push(head);
    this.board.checkInput(head);
  }

  handleInput(e)
  {
    if (!this.accept_input)
      return;

    switch (e.key) {
      case "ArrowRight":
      case "d":
        this.player.direction = Direction.right;
        break;
      case "ArrowLeft":
      case "a":
        this.player.direction = Direction.left;
        break;
      case "ArrowUp":
      case "w":
        this.player.direction = Direction.up;
        break;
      case "ArrowDown":
      case "s":
        this.player.direction = Direction.down;
        break;
      case " ":
        this.loop ? this.pause() : this.start();
        break;
      default:
        break;
    }
  }
};
