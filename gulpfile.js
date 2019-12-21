"use strict";

// Modules
const path = require("path");
const fs = require("fs");
const stream = require("stream");
const { src, dest, parallel } = require("gulp");
const configs = require("./configs.js");

// Paths
const paths = require("./paths.js");

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

function create_task(page, _gulp) {
  function _task() {
    return src([
        path.join(paths.src, page.basename, _gulp.fin, _gulp.glob),
        path.join("!", paths.src, page.basename, _gulp.fin, "assets", _gulp.glob)
      ])
      .pipe(create_transform_queue(_gulp.transforms))
      .pipe(dest(path.join(paths.dst, page.basename === "root" ? "" : page.basename, _gulp.fout)));
  }

  _task.displayName = `Transforming ${path.join(page.basename, _gulp.fin)}`;

  return _task;
};

// Transform .pug to .html
const pug = require("gulp-pug");
const create_pug_task = page => create_task(page, {
  fin: "pug",
  glob: "*.pug",
  fout: "",
  transforms: [pug({ locals: page.pug_data })]
});

// Transform .scss to .css
const scss = require("gulp-sass");
scss.compiler = require("node-sass");
const create_scss_task = page => create_task(page, {
  fin: "scss",
  glob: "**/!(_*)",
  fout: "css",
  transforms: [scss().on("error", scss.logError)]
});

// Move Assets
const create_move_task = (page, fmove) => create_task(page, {
  fin: fmove,
  glob: "**",
  fout: fmove
});

// Create tasks
configs.forEach(page => {
  // Pug
  if (fs.existsSync(path.join(page.full_path, "pug")))
    tasks.push(create_pug_task(page));

  // SCSS
  if (fs.existsSync(path.join(page.full_path, "scss")))
    tasks.push(create_scss_task(page));

  // JS
  if (fs.existsSync(path.join(page.full_path, "js")))
    tasks.push(create_move_task(page, "js"));

  // Images
  if (fs.existsSync(path.join(page.full_path, "img")))
    tasks.push(create_move_task(page, "img"));
});

// CNAME
tasks.push(
  () => src(path.join(paths.src, "CNAME")).pipe(dest(paths.dst, "CNAME"))
);

// Exports
exports.build = parallel(tasks.length ? tasks : noop => noop());