"use strict";

const path = require("path");
const fs = require("fs");

module.exports = {
  name: "root",

  is_root: true,

  pug_data: {
    get projects() {
      const pages_iterator = require("../../pages_iterator.js");

      return pages_iterator.configs.filter(config => config.basename !== "root" && config.display_on_frontpage)
    }
  }
}
