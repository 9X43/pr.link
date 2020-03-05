const { env_aware_domain } = require("./utils.js");
const configs = require("../configs.js");
const apex = env_aware_domain("pr.link");

module.exports = {
  apex,
  whitelist: configs.reduce((w, c) => c.vhost ? w.concat(c.vhost) : w, [apex])
};