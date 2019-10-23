"use strict";


// Modules
const path = require("path");
const { src, dest, parallel } = require("gulp");


// Paths
const root = __dirname;


// Gulpfiles
const content_gulpfile = require(path.join(root, "content", "gulpfile.js"));


// Tasks
exports.build = parallel(
  content_gulpfile
);
