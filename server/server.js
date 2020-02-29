const path = require("path");
const fs = require("fs");
const { is_live, paths } = require("../globals.js");
const http = require("http");
const https = require("https");
const ports = {
  http:  process.env.PORT || 8000,
  https: process.env.PORT || 8443
};

module.exports = (app) => {
  if (is_live) {
    app.listen(ports.http);
  } else {
    http.createServer(app).listen(ports.http);
    https.createServer({
      key:  fs.readFileSync(path.join(paths.root, "certs/pr.local.key")),
      cert: fs.readFileSync(path.join(paths.root, "certs/pr.local.crt"))
    }, app).listen(ports.https);
  }
}