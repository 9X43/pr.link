// Modules
const express = require("express");
const enforce = require("express-sslify")
const   vhost = require("vhost");

const    path = require("path");
const      fs = require("fs");
const     app = express();

// Middleware
if (process.env.NODE_ENV === "production") {
  app.use(enforce.HTTPS({trustProtoHeader: true}));
}

// Paths
const root = __dirname;

// Add Sites
const sites = path.join(root, "sites");
const BuildSite = (dir, site) => {
  let type = Object.keys(site).includes("type") ? site.type : undefined;
  if (type === "link") return;

  ["folder", "path", "route"].forEach(required_prop => {
    if (!Object.keys(site).includes(required_prop)) {
      throw new Error(`Site "${dir}" does not include a "${required_prop}" property.`);
    }
  });

  const site_app_root = path.join(root, "sites", site.folder);

  ["public", "views"].forEach(required_dir => {
    if (!fs.existsSync(path.join(site_app_root, required_dir))) {
      throw new Error(`Site "${site.folder}" does not have a "${required_dir}" directory.`);
    }
  })

  const site_app = express();
  site_app.set("view engine", "pug");
  site_app.set("views", path.join(site_app_root, "views"));
  site_app.use(express.static(path.join(site_app_root, "public")));
  site.route(site_app);

  app.use(path.join("/", site.path), site_app);
};

if (fs.existsSync(sites)) {
  fs.readdirSync(sites)
    .map(file => path.join(sites, file))
    .filter(file => fs.lstatSync(file).isDirectory())
    .forEach(dir => {
      const app_path = path.join(dir, "app.js");

      if (fs.existsSync(app_path)) {
        const settings = require(app_path);
        BuildSite(dir, settings);
      } else {
        throw new Error(`The site at "${dir}" is missing "app.js".`);
      }
    });
}

// Route
app.get("*", (req, res, next) => {
  res.status(404).send();
});

// Settings
app.set("port", process.env.PORT || 5000);

// Listen
app.listen(app.get("port"));
