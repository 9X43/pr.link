"use strict";

const fontsize_picker = document.querySelector(".fontsize-picker");
const articles_wrapper = document.querySelector("main.articles");

fontsize_picker.addEventListener("click", e => {
  const current_size = articles_wrapper.style.fontSize;
  const action = e.target.dataset.action;

  if (action) {
    articles_wrapper.style.fontSize = current_size.replace(
      /(\d*(?:\.\d*)?)/,
      size => action === "increase" ? Number(size) + .1 : Number(size) - .1);

    wikitype.move_active_token_into_view();
  }
}, true);
