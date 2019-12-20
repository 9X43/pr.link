"use strict";

// Modules
const path = require("path");
const fs = require("fs");
const deep_clone = obj => JSON.parse(JSON.stringify(obj));

// Config
class config_parser {
  static from(cpath) {
    cpath = path.join(cpath, "config.js");

    let config;

    if (!fs.existsSync(cpath))
      throw new Error(`Config not found: '${cpath}'.`);

    try {
      config = require(cpath);

      config_parser.assert_keys(Object.keys(config));
    } catch(e) {
      throw new Error(`Config require failed: '${cpath}'.\n${e}`);
    }

    config = Object.assign(deep_clone(config_parser.default_config), config);

    config.full_path = path.dirname(cpath);
    config.basename = path.basename(config.full_path);

    config.preview_type = /\.mp4$/.test(config.preview) ? "video" : "image";

    return config;
  }

  static assert_keys(keys) {
    const invalid_keys = keys.filter(k => !config_parser.default_config.hasOwnProperty(k));

    if (invalid_keys.length) {
      throw new Error(`Found ${invalid_keys.length} (${invalid_keys.join(", ")}) invalid key(s).`);
    }
  }
};

config_parser.default_config = Object.freeze({
  // System
  basename: "project-name",
  full_path: "content/project/project-name",
  type: "tbr",

  // Meta
  name: "Project Name",
  description: "Short description about the project.",
  keywords: ["Website"],
  created: "JAN 0000",

  // Preview
  extern_url: false,
  preview: "img/preview.jpg",
  preview_type: "image|video",

  // Flags
  display_on_frontpage: false,
  is_root: false,

  // Express
  route: false,
  vhost: false,

  // Data
  pug_data: {}
});

module.exports = exports = config_parser;
