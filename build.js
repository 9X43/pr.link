// Modules
const  sass = require("node-sass");
const chalk = require("chalk");
const   pug = require("pug");

const    fs = require("fs");
const  path = require("path");

// Paths
const  root = __dirname;
const sites = path.join(root, "sites");

console.log(chalk.cyan("! [Started Build]\n"));

// Convert .scss to .css
(function ConvertScss(root, sites) {
  console.log(chalk.magenta("→ Converting .scss"));

  fs.readdirSync(sites)
    .map(file => path.join(sites, file, "public", "css"))
    .filter(file => fs.existsSync(file))
    .forEach(dir => {
      fs.readdirSync(dir)
        .map(file => path.join(dir, file))
        .filter(file => path.extname(file) === ".scss")
        .forEach(scss => {
          const css_file = scss.replace(/scss$/, "css");
          const result = sass.renderSync({
            file: scss,
            outFile: css_file,
            outputStyle: "expanded"
          });

          fs.writeFileSync(css_file, result.css);

          if (result.css.compare(fs.readFileSync(css_file)) === 0) {
            console.log(`✓ Converted "${scss}" to css`);
          } else {
            throw new Error(`"${css_file}" could not be written`);
          }
        });
    });

    console.log(/* line break */);
})(root, sites);

// Render root index.html page
(function RenderRootHtml(root, sites) {
  console.log(chalk.magenta("→ Rendering root index.html"));

  let articles = [];

  if (fs.existsSync(sites)) {
    fs.readdirSync(sites)
      .map(file => path.join(sites, file))
      .filter(file => fs.lstatSync(file).isDirectory())
      .forEach(dir => {
        const app_file = path.join(dir, "app.js");

        if (fs.existsSync(app_file)) {
          const app = require(app_file);

          if (app.meta) articles.push(app.meta);
        }
      });
  }

  const ifile = path.join(sites, "root", "views", "index.pug");
  const ofile = path.join(sites, "root", "public", "index.html");

  const html = pug.renderFile(ifile, {articles: articles});
  const buffer = Buffer.from(html);

  fs.writeFileSync(ofile, buffer);

  if (buffer.compare(fs.readFileSync(ofile)) === 0) {
    console.log("✓ Rendered root index.html");
  } else {
    throw new Error("Could not render root index.html");
  }

  console.log(/* line break */);
})(root, sites);

// All done
console.log(chalk.cyan("✓ [Build complete]"));