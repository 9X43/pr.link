"use strict";

const path = require("path");
const fs = require("fs");
const deep_clone = obj => JSON.parse(JSON.stringify(obj));

class parser {
  static from(cpath) {
    cpath = path.join(cpath, "config.js");

    if (!fs.existsSync(cpath)) {
      throw new Error(`Config not found: '${cpath}'.`);
    }

    let config;
    try {
      config = require(cpath);
      parser._assert_keys(Object.keys(config));
    } catch(e) {
      throw new Error(`Config require failed: '${cpath}'.\n${e}`);
    }

    config = Object.assign(deep_clone(parser._default_config), config);
    config.full_path = path.dirname(cpath);
    config.basename = path.basename(config.full_path);
    config.preview_type = /\.mp4$/.test(config.preview) ? "video" : "image";

    return config;
  }

  static _assert_keys(keys) {
    const invalid_keys = keys.filter(k => !parser._default_config.hasOwnProperty(k));

    if (invalid_keys.length) {
      throw new Error(`Found ${invalid_keys.length} (${invalid_keys.join(", ")}) invalid key(s).`);
    }
  }
};

parser._default_config = Object.freeze({
  // Path
  basename: undefined,
  full_path: undefined,

  // Meta
  name: undefined,
  description: undefined,
  keywords: [],
  created: undefined,

  // Preview
  preview: "img/preview.jpg",
  preview_type: "image",

  // Flags
  display_on_frontpage: false,
  is_root: false,

  // Express
  route: false,
  whitelist_domain: false,

  // Data
  pug_data: {}
});

module.exports = parser;
