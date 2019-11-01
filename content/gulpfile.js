"use strict";


// Modules
const path = require("path");
const fs = require("fs");
const stream = require("stream");
const { src, dest, parallel } = require("gulp");
const content_iterator = require("./content_iterator.js");


// Paths
const content = {
  root: {
    src: path.join(__dirname, "src"),
    dest: path.join(__dirname, "dest")
  }
};


// Tasks
let tasks = [];


// Helper functions
function create_transform_queue(transforms) {
  return stream.Transform({
    objectMode: true,
    transform: (vinyl, encoding, callback) => {
      if (!transforms) {
        callback(null, vinyl);
        return;
      }

      let called_back = {};

      transforms.forEach((transform, i) => {
        called_back[String(i)] = false;

        transform.write(vinyl, encoding, () => {
          called_back[String(i)] = true;
          create_transform_queue.is_done(called_back) && callback(null, vinyl);
        })
      })
    }
  });
};

create_transform_queue.is_done = cbs => Object.keys(cbs).reduce((b, i) => b && cbs[i], true);

function create_task(config, _gulp) {
  function _task() {
    return src(path.join(content.root.src, config.type, config.basename, _gulp.fin, _gulp.glob))
      .pipe(create_transform_queue(_gulp.transforms))
      .pipe(dest(path.join(content.root.dest, config.type, config.basename, _gulp.fout)));
  }

  _task.displayName = `Transforming ${path.join(config.basename, _gulp.fin)}`;

  return _task;
};


// Transform .pug to .html
const pug = require("gulp-pug");
const create_pug_task = config => create_task(config, {
  fin: "pug",
  glob: "*.pug",
  fout: "",
  transforms: [pug({locals: config.pug_data})]
});


// Transform .scss to .css
const scss = require("gulp-sass");
scss.compiler = require("node-sass");
const create_scss_task = config => create_task(config, {
  fin: "scss",
  glob: "**/!(_*)",
  fout: "css",
  transforms: [scss().on("error", scss.logError)]
});


// Move Assets
const create_move_task = (config, fmove) => create_task(config, {
  fin: fmove,
  glob: "**",
  fout: fmove
});


// Create tasks
content_iterator.iterate(config => {
  // Pug
  if (fs.existsSync(path.join(config.full_path, "pug")))
    tasks.push(create_pug_task(config));

  // SCSS
  if (fs.existsSync(path.join(config.full_path, "scss")))
    tasks.push(create_scss_task(config));

  // JS
  if (fs.existsSync(path.join(config.full_path, "js")))
    tasks.push(create_move_task(config, "js"));

  // Images
  if (fs.existsSync(path.join(config.full_path, "img")))
    tasks.push(create_move_task(config, "img"));
});


// Exports
module.exports = tasks.length ? tasks : cb => cb();
