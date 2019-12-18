"use strict";

function marquee(node) {
  const id = marquee.id.next().value;
  const dir = node.dataset.dir;
  const text = node.dataset.text;

  const ul = marquee.create_markup(text);
  node.appendChild(ul);
  marquee.fill_text(ul);

  const li_width = ul.querySelector("li").getBoundingClientRect().width;
  const style = marquee.create_style(id, dir, li_width);
  ul.style.animation = marquee.create_animation_css(id, li_width);
  document.head.appendChild(style);
}

marquee.create_markup = function(text) {
  const ul = document.createElement("ul");
  const li = document.createElement("li");

  li.appendChild(document.createTextNode(text));
  ul.appendChild(li);

  return ul;
}

marquee.fill_text = function(ul) {
  let last_li_pos = 0;
  while (last_li_pos < document.body.clientWidth) {
    ul.appendChild(ul.querySelector("li").cloneNode(true));
    last_li_pos = ul.querySelector("li:last-child").getBoundingClientRect().left;
  }
}

marquee.create_animation_css = function(id, width) {
  return marquee.css.animation
    .replace("ID", id)
    .replace("DUR", 100 / 3000 * width)
}

marquee.create_style = function(id, dir, width) {
  const style = document.createElement("style");
  const text = marquee.css.keyframes
    .replace("ID", id)
    .replace(/DIR/g, (dir === "rtl") ? "left" : "right")
    .replace("MV", width);

  style.appendChild(document.createTextNode(text));

  return style;
}

marquee.css = {
  keyframes: "@keyframes marquee_ID { from { DIR: 0; } to { DIR: -MVpx; } }",
  animation: "marquee_ID DURs linear infinite"
}

marquee.id = (function*() {
  let id = 0;

  for (;;) {
    yield id++;
  }
}());

window.addEventListener("load", () => {
  setTimeout(() => {
    Array.from(document.querySelectorAll(".marquee")).forEach(marquee);
  }, 100);
});
