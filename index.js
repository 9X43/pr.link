// Node Modules
const path = require("path");
const fs = require("fs");


// Helper functions
const is_live = () => process.env.NODE_ENV === "production";


// Paths
const root = __dirname;
const domain = is_live() ? "pr.link" : "prlocal.link";
const content = {
  root: path.join(root, "content"),
  src: path.join(root, "content", "src"),
  dest: path.join(root, "content", "dest")
};


// Modules
// const session = require("express-session");
const helmet = require("helmet");
const enforce = require("express-sslify");
const pug = require("pug");
const content_iterator = require(path.join(content.root, "content_iterator.js"));
const fontstack = require("fonts.pr.link")({ "whitelisted_domain": domain });
const express = require("express");
const app = express();


// App settings
app.set("trust proxy", 1);


// Middleware
app.use(enforce.HTTPS({ trustProtoHeader: true }));
app.use(helmet());
// app.use(session({  // TODO: Use postgres for cookie storage
//   name: "sid",
//   secret: "",  // TODO: Get secret from heroku env
//   resave: false,
//   saveUninitialized: false,
//   cookie: { secure: true }
// }));


// Add project specific routes
content_iterator.iterate(config => {
  if (config.route) {
    app.use(`/${config.type}/${config.basename}`, config.route(express.Router()));
  }
});


// Static assets
app.use("/fonts", fontstack);

content_iterator.iterate_dirs(dir => {
  content_iterator.iterate(config => {
    if (config.is_root) {
      app.use("/", express.static(path.join(content.dest, dir, config.name)));
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

if (is_live()) {
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
