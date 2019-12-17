// Node Modules
const path = require("path");
const fs = require("fs");

// Helper functions
const root_domain = "www.pr.link";
const is_live = process.env.NODE_ENV === "production";
const make_domain = domain => is_live ? domain : domain.replace(/(?<=\.)([^\.]+)$/, "local");

// Paths
const root = __dirname;
const content = {
  root: path.join(root, "content"),
  src: path.join(root, "content", "src"),
  dest: path.join(root, "content", "dest")
};

// Modules
const helmet = require("helmet");
const enforce = require("express-sslify");
const pug = require("pug");
const content_iterator = require(path.join(content.root, "content_iterator.js"));
let whitelisted_domains = [make_domain(root_domain)];
const fontstack = require("fonts.pr.link");
const vhost = require("vhost");
const express = require("express");
const app = express();

// App settings
app.set("trust proxy", 1);

// Middleware
app.use(enforce.HTTPS({ trustProtoHeader: true }));
app.use(helmet());

// Add project specific routes
content_iterator.iterate(config => {
  if (config.vhost) {
    whitelisted_domains.push(make_domain(config.vhost));
  }

  if (config.route) {
    app.use(`/${config.type}/${config.basename}`, config.route(express.Router()));
  }
});

// Static assets
app.use("/fonts", fontstack(whitelisted_domains));

content_iterator.iterate_dirs(dir => {
  content_iterator.iterate(config => {
    if (config.is_root) {
      app.use("/", express.static(path.join(content.dest, dir, config.basename)));
    }

    if (config.vhost) {
      app.use(vhost(make_domain(config.vhost), express.static(path.join(content.dest, dir, config.basename))));
    }
  }, [dir]);

  app.use(`/${dir}`, express.static(path.join(content.dest, dir)));
});

// 404
app.get("*", (req, res) => {
  res.status(404).end();
});

// Listen
const ports = {
  http:  process.env.PORT || 8000,
  https: process.env.PORT || 8443
};

if (is_live) {
  app.listen(ports.http);
} else {
  const http = require("http");
  http.createServer(app).listen(ports.http);

  const https = require("https");
  https.createServer({
    key:  fs.readFileSync(path.join(root, "certs/localhost.key")),
    cert: fs.readFileSync(path.join(root, "certs/localhost.crt"))
  }, app).listen(ports.https);
}
