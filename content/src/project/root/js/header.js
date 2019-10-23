class mix_blend_header {
  constructor() {
    this.image_size = 300;

    // Nodes
    this.container = document.querySelector(".rgb-container");
    this.red = this.container.querySelector(".r");
    this.green = this.container.querySelector(".g");
    this.blue = this.container.querySelector(".b");

    // Dimensions
    this.dom_rect = this.container.getBoundingClientRect();
    this.rect = {
      top: this.dom_rect.top + window.pageYOffset,
      left: this.dom_rect.left,
      width: this.dom_rect.width,
      height: this.dom_rect.height,
      center_x: this.dom_rect.left + this.dom_rect.width / 2,
      center_y: this.dom_rect.top + window.pageYOffset + this.dom_rect.height / 2
    };

    // Limits
    this.limits = {
      max_horizontal_distance_px: this.image_size / 2,
      max_skew_angle: 10,
      min_alpha: .6
    }

    // Flags
    this.is_visible = true;
    new IntersectionObserver(e => this.is_visible = e[0].isIntersecting).observe(this.container);

    // Animate
    window.addEventListener("mousemove", e => this.is_visible && window.requestAnimationFrame(
      this.transform.bind(this, e.clientX, e.clientY))
    );
  }

  transform(client_x, client_y) {
    const [x, y] = [
      client_x > this.rect.center_x ? this.rect.center_x - (client_x - this.rect.center_x) : client_x,
      client_y > this.rect.center_y ? this.rect.center_y - (client_y - this.rect.center_y) : client_y
    ];

    const diff_x = 1 / this.rect.center_x * (this.rect.center_x - x);
    const left_transform = this.limits.max_horizontal_distance_px * diff_x;
    if (client_x < this.rect.center_x) {
      this.red.style.left = `${left_transform * -1}px`;
      this.blue.style.left = `${left_transform}px`;
    } else {
      this.red.style.left = `${left_transform}px`;
      this.blue.style.left = `${left_transform * -1}px`;
    }

    const diff_y = Math.min(1 / this.rect.center_y * (this.rect.center_y - y), 1);
    const skew = this.limits.max_skew_angle * diff_y;
    if (client_y < this.rect.center_y) {
      this.red.style.transform = `skew(${skew}deg, ${skew}deg)`;
      this.blue.style.transform = `skew(-${skew}deg, -${skew}deg)`;
    } else {
      this.red.style.transform = `skew(-${skew}deg, -${skew}deg)`;
      this.blue.style.transform = `skew(${skew}deg, ${skew}deg)`;
    }

    const total_diff = (diff_y + diff_x) / 2;
    this.container.style.opacity = Math.max(this.limits.min_alpha, (1 - total_diff));
  }
}

new mix_blend_header();
