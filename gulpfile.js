"use strict";

// Modules
const path = require("path");
const fs = require("fs");
const stream = require("stream");
const { src, dest, parallel } = require("gulp");
const configs = require("./configs.js");

// Globals
const { is_live, domain, paths } = require("./globals.js");

// Tasks
let tasks = [];

// Helper functions
function create_transform_queue(transforms) {
  return stream.Transform({
    objectMode: true,
    transform: (vinyl, encoding, callback) => {
      if (!transforms) {
        return void callback(null, vinyl);
      }

      function call_transform(queue_idx = 0) {
        const current_transform = transforms[queue_idx];

        current_transform.write(vinyl, encoding, () => {
          if (queue_idx >= transforms.length - 1) {
            return void callback(null, vinyl);
          }

          call_transform(++queue_idx);
        });
      };

      call_transform();
    }
  });
};

function create_task(page, _gulp) {
  const transform_queue = create_transform_queue(_gulp.transforms);

  function _task() {
    return src([
        path.join(paths.src, page.basename, _gulp.fin, _gulp.glob),
        path.join("!", paths.src, page.basename, _gulp.fin, "assets", _gulp.glob),
        path.join("!", paths.src, page.basename, _gulp.fin, "assets")
      ])
      .pipe(transform_queue)
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
  transforms: [
    scss().on("error", scss.logError),
    stream.Transform({
      objectMode: true,
      transform: (vinyl, encoding, callback) => {
        if (process.env.NODE_ENV !== "production") {
          vinyl.contents = Buffer.from(
            vinyl.contents.toString().replace(/d\.pr\.link/g, domain => {
              return "d.pr.local:8443";
            })
          );
        }

        callback(null, vinyl);
      }
    })
  ]
});

// Move Assets
const create_move_task = (page, fmove, transforms = false) => create_task(page, {
  fin: fmove,
  glob: "**/!(_*)",
  fout: fmove,
  transforms: transforms
});

// Create tasks
configs.forEach(page => {
  if (process.env.BUILD_PAGE && process.env.BUILD_PAGE !== page.name) {
    return;
  }

  // Pug
  if (fs.existsSync(path.join(page.full_path, "pug")))
    tasks.push(create_pug_task(page));

  // SCSS
  if (fs.existsSync(path.join(page.full_path, "scss")))
    tasks.push(create_scss_task(page));

  // JS
  if (fs.existsSync(path.join(page.full_path, "js")))
    tasks.push(create_move_task(page, "js", [stream.Transform({
      objectMode: true,
      transform: (vinyl, encoding, callback) => {
        vinyl.contents = Buffer.from(
          vinyl.contents.toString().replace(/DYNAMIC_ROOT/g, () => {
            return domain.env_aware.dynamic_root;
          })
        );

        callback(null, vinyl);
      }
    })]));

  // Images
  if (fs.existsSync(path.join(page.full_path, "img")))
    tasks.push(create_move_task(page, "img"));
});

// CNAME
if (!process.env.BUILD_PAGE) {
  tasks.push(
    () => src(path.join(paths.src, "CNAME")).pipe(dest(paths.dst, "CNAME")),
    () => src(path.join(paths.src, "favicon.png")).pipe(dest(paths.dst, "favicon.png"))
  );
}

// Exports
exports.build = parallel(tasks.length ? tasks : noop => noop());