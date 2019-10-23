"use strict";

class LanguagePicker {
  constructor() {
    this.button = document.querySelector(".language-picker .icon");
    this.module = document.querySelector(".languages");
    this.language_nodes = this.module.querySelectorAll("li");

    this.default_language = "en";

    this.button.addEventListener("click", this.toggle_module_visibility.bind(this));
    this.module.addEventListener("click", this.prevent_no_checked_lang.bind(this));
  }

  toggle_module_visibility() {
    this.module.classList.toggle("open");
  }

  get_checked_langcodes() {
    return Array.from(this.language_nodes)
      .map(li => li.querySelector("input"))
      .filter(input => input.checked)
      .map(input => input.id);
  }

  prevent_no_checked_lang() {
    if (this.get_checked_langcodes().length === 0) {
      this.module.querySelector(`input[id=${this.default_language}]`).checked = true;
    }
  }

  get_random_checked_language_code() {
    const checked_langcodes = this.get_checked_langcodes();
    return checked_langcodes[Math.floor(Math.random() * checked_langcodes.length)];
  }

  extend_language_code(code) {
    return this.module
      .querySelector(`label[data-langcode=${code}]`)
      .dataset.lang;
  }
};

const language_picker = new LanguagePicker();
