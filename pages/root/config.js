"use strict";

const path = require("path");
const fs = require("fs");

module.exports = {
  name: "root",

  is_root: true,

  pug_data: {
    get projects() {
      return require("../../configs.js").filter(
        page => page.basename !== "root" && page.display_on_frontpage
      );
    }
  }
}
