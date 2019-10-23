"use strict";


// Modules
const path = require("path");
const fs = require("fs");
const parse_config = require("./config_parser.js");


// Paths
const content_src_root = path.join(__dirname, "src");
let content_dirs = {};
fs.readdirSync(content_src_root, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name)
  .forEach(dir => content_dirs[dir] = path.join(content_src_root, dir));


// Content Iterator
class content_iterator {
  constructor(content_dirs) {
    this.configs = {};
    Object.keys(content_dirs).forEach(dir_name => {
      this.configs[dir_name] = this.load_configs(content_dirs[dir_name]);
    })
  }

  load_configs(dir) {
    return fs.readdirSync(dir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => {
        const config = parse_config.from(path.join(dir, dirent.name, "config.js"));

        config.type = path.basename(dir);

        return config;
      })
  }

  get_contents(filter_types = Object.keys(this.configs)) {
    return filter_types
      .map(type => {
        if (this.configs.hasOwnProperty(type))
          return this.configs[type];

        throw new Error(`Unknown type: "${type}".`);
      })
      .reduce((acc, i) => acc.concat(i), [])
      .sort((a, b) => new Date(b.created) - new Date(a.created));
  }

  iterate_dirs(callback) {
    Object
      .keys(this.configs)
      .forEach(callback);
  }

  iterate(callback, filter_types = Object.keys(this.configs)) {
    this
      .get_contents(filter_types)
      .forEach(callback);
  }
}


module.exports = exports = new content_iterator(content_dirs);
