const domain = require("../global/domains.js");
const enforce = require("express-sslify");
const helmet = require("helmet");
const cookie_session = require("cookie-session");
const cors = require("./cors.js")(domain.apex);

module.exports = (app) => {
  app.set("trust proxy", 1);
  app.use(enforce.HTTPS({ trustProtoHeader: true }));
  app.use(helmet());
  app.use((req, res, next) => {
    if (req.headers.host.substr(0, 4) !== "www.")
      return void next();

    let apex_host = req.headers.host.substr(4);
    if (domain.whitelist.includes(apex_host))
      res.redirect(301, `https://${apex_host}${req.path === "/" ? "" : req.path}`);
    else
      res.status(404).end();
  });
  app.use(cors);
  app.use(cookie_session({
    "name": "session",
    "secret": process.env.COOKIE_SECRET
  }));
};