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
  src: path.join(root, "pages"),
  dest: path.join(root, "dest")
};

// Modules
const helmet = require("helmet");
const enforce = require("express-sslify");
const pug = require("pug");
const pages_iterator = require("./pages_iterator.js");
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

// Fonts
app.use("/fonts", fontstack(whitelisted_domains));


pages_iterator.iterate(page => {
  if (page.is_root) {
    app.use("/", express.static(path.join(content.dest, page.basename)));
  }

  if (page.vhost) {
    whitelisted_domains.push(make_domain(page.vhost));
    app.use(vhost(make_domain(page.vhost), express.static(path.join(content.dest, page.basename))));
  }

  if (page.route) {
    app.use(`/${page.basename}`, page.route(express.Router()));
  }
});

app.use("/", express.static(content.dest));

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
