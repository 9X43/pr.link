"use strict";


// Modules
const path = require("path");
const fs = require("fs");


// Config
module.exports = {
  name: "root",

  is_root: true,

  pug_data: {
    get projects() {
      const content_iterator = require("../../../content_iterator.js");

      return content_iterator
        .get_contents()
        .filter(config => config.basename !== "root" && config.display_on_frontpage);
    }
  }
}
