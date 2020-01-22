global.ptrckr = {};

// Node Modules
const path = require("path");
const fs = require("fs");

// Globals
const { is_live, make_domain, domain, paths } = require("./globals.js");

// Modules
const helmet = require("helmet");
const enforce = require("express-sslify");
const pug = require("pug");
const configs = require("./configs.js");
const cors = require("./cors.js")(domain.env_aware.whitelisted);
const fontstack = require("fonts.pr.link");
const vhost = require("vhost");
const express = require("express");
const app = express();

// App settings
app.set("trust proxy", 1);

// Middleware
app.use(enforce.HTTPS({ trustProtoHeader: true }));
app.use((req, res, next) => {
  if (req.headers.host.substr(0, 3) === "www")
    return res.redirect(301, `https://${domain.env_aware.apex}`);
  else
    return next();
});
app.use(helmet());
app.use(cors);

configs.forEach(page => {
  if (page.is_root) {
    app.use("/", express.static(path.join(paths.dst, page.basename)));
  }

  if (page.vhost) {
    app.use(vhost(make_domain(page.vhost), express.static(path.join(paths.dst, page.basename))));
  }

  if (page.route) {
    app.use(`/${page.basename}`, page.route(express.Router()));
  }
});

// Fonts
app.use("/fonts", fontstack(domain.env_aware.whitelisted));

// Static files
app.use("/", express.static(paths.dst));

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
    key:  fs.readFileSync(path.join(paths.root, "certs/pr.local.key")),
    cert: fs.readFileSync(path.join(paths.root, "certs/pr.local.crt"))
  }, app).listen(ports.https);
}
