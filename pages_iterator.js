"use strict";

// Modules
const path = require("path");
const fs = require("fs");
const parse_config = require("./config_parser.js");

// Pages
const pages_root = path.join(__dirname, "pages");
const pages = fs
  .readdirSync(pages_root, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => path.join(pages_root, dirent.name));

// Content Iterator
class pages_iterator {
  constructor(pages) {
    this.configs = pages.map(page => {
      return parse_config.from(page);
    });
  }

  iterate(callback) {
    this.configs
      .sort((a, b) => new Date(b.created) - new Date(a.created))
      .forEach(callback);
  }
}

module.exports = new pages_iterator(pages);
