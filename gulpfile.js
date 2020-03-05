global._root = __dirname;

// Modules
const path = require("path");
const fs = require("fs");
const stream = require("stream");
const { src, dest, parallel } = require("gulp");
const configs = require("./configs.js");
const { is_live } = require("./global/utils.js");
const paths = require("./global/paths.js");
const domain = require("./global/domains.js");

// Helper functions
function prepend_relative_dir(dirname) {
  return stream.Transform({
    objectMode: true,
    transform: (vinyl, encoding, callback) => {
      vinyl.path = path.join(vinyl.base, dirname, vinyl.relative);
      callback(null, vinyl);
    }
  });
}

function remove_trailing_dir(depth = 1) {
  return stream.Transform({
    objectMode: true,
    transform: (vinyl, encoding, callback) => {
      let _depth = depth;
      while(_depth--)
        vinyl.dirname = path.dirname(vinyl.dirname);

      callback(null, vinyl);
    }
  });
}

function rename_trailing_dir_to(replacement) {
  return stream.Transform({
    objectMode: true,
    transform: (vinyl, encoding, callback) => {
      vinyl.dirname = path.join(path.dirname(vinyl.dirname), replacement);
      callback(null, vinyl);
    }
  });
}

// Transform .pug to .html
function pug_to_html(done) {
  const pug = require("gulp-pug");

  function render(idx = 0) {
    const project = configs[idx];
    const folder = project.basename;
    const pug_data = project.pug_data;
    const source = src(
      `${paths.src}/${folder}/**/pug/*.pug`,
      { base: paths.src }
    );

    source
      .pipe(pug({ locals: pug_data }))
      .pipe(remove_trailing_dir(2))  // src/project/pug/*.pug ⟶ dest/*.html
      .pipe(dest(paths.dst).on("end", () => {
        if (configs[idx + 1] === undefined) done();
        else render(++idx);
      }));
  }

  render();
}

// Transform .scss to .css
function scss_to_css() {
  const global_scss_file = path.join(paths.src, "_globals.scss");
  const scss = require("gulp-sass");
  scss.compiler = require("node-sass");

  fs.writeFileSync(global_scss_file,
    `$domain: "https://${domain.apex}";`
  );

  return src(`${paths.src}/**/scss/**/!(_*)`, { dot: true })
    .pipe(scss({ includePaths: paths.src }).on("error", scss.logError))
    .pipe(rename_trailing_dir_to("css"))
    .pipe(prepend_relative_dir("static"))
    .pipe(dest(paths.dst).on("end", () => fs.unlinkSync(global_scss_file)));
}

// Move js/ directories
function move_js() {
  return src(`${paths.src}/**/js/**/!(_*)`, { dot: true })
    .pipe(prepend_relative_dir("static"))
    .pipe(dest(paths.dst));
}

// Move img/ directories
function move_img() {
  const glob = [
    `${paths.src}/**/img/**/!(_*)`,
    `!${paths.src}/**/{assets,assets/**}`
  ];

  return src(glob, { dot: true })
    .pipe(prepend_relative_dir("static"))
    .pipe(dest(paths.dst));
}

// Move root files (favicon)
function move_root_files() {
  const root_files = fs
    .readdirSync(paths.src, { withFileTypes: true })
    .filter(dirent => dirent.isFile() && dirent.name[0] !== "." && dirent.name[0] !== "_")
    .map(file => file.name);

  return src(`${paths.src}/${root_files.length > 1 ? `{${root_files.join(",")}}` : root_files[0]}`)
    .pipe(dest(paths.static));
}

// Exports
exports.build = parallel(move_root_files, pug_to_html, scss_to_css, move_img, move_js);
