const path = require("path");

const is_live = process.env.NODE_ENV === "production";
const make_domain = domain => is_live ? domain : domain.replace(/(?<=\.)([^\.]+)$/, "local:8443");

const domain = {
  env_aware: {}
};

domain.static_root = "pr.link";
domain.dynamic_root = `d.${domain.static_root}`;

domain.env_aware.static_root = make_domain("pr.link");
domain.env_aware.dynamic_root = make_domain(`d.${domain.static_root}`);

module.exports = {
  is_live: is_live,
  make_domain: make_domain,
  domain: domain,
  paths: {
    root: __dirname,
    src: path.join(__dirname, "pages"),
    dst: path.join(__dirname, "docs")
  }
}