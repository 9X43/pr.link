"use strict";

const theme_picker = document.querySelector(".theme-picker");

Array.from(document.styleSheets[0].cssRules)
  .filter(css => css.selectorText)
  .map(css => css.selectorText)
  .filter(s => /.theme-picker ul li.(.*)-theme/.test(s))
  .map(css => /li\.(?<theme>[^-]*)-theme/.exec(css).groups.theme)
  .forEach(theme => {
    const parent = theme_picker.querySelector("ul");
    const item = document.createElement("li");
    item.setAttribute("class", `icon ${theme}-theme`);
    item.dataset.theme = theme;

    parent.appendChild(item);
  });

theme_picker.addEventListener("click", e => {
  const theme = e.target.dataset.theme;
  const current = document.documentElement;

  if (theme) {
    current.className = current.className.replace(/[^\s]*(?=-theme)/, theme);
  }
}, false);
