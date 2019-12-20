"use strict";

const path = require("path");
const fs = require("fs");
const parse_config = require("./config_parser.js");

const pages_root = path.join(__dirname, "pages");
const configs = fs
  .readdirSync(pages_root, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => path.join(pages_root, dirent.name))
  .map(page => parse_config.from(page))
  .sort((a, b) => new Date(b.created) - new Date(a.created));

module.exports = configs;
