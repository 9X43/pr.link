const { domain } = require("../globals.js");
const enforce = require("express-sslify");
const helmet = require("helmet");
const cookie_session = require("cookie-session");
const cors = require("./cors.js")(domain.env_aware.whitelisted);

module.exports = (app) => {
  app.set("trust proxy", 1);
  app.use(enforce.HTTPS({ trustProtoHeader: true }));
  app.use(helmet());
  app.use((req, res, next) => {
    if (req.headers.host.substr(0, 4) === "www.")
      return res.redirect(301, `https://${domain.env_aware.apex}`);
    else
      return next();
  });
  app.use(cors);
  app.use(cookie_session({
    "name": "session",
    "secret": process.env.COOKIE_SECRET
  }));
};