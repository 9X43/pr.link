const path = require("path");
const configs = require("./configs.js");

const is_live = process.env.NODE_ENV === "production";
const make_domain = domain => is_live ? domain : domain.replace(/(?<=\.)([^\.]+)$/, "local:8443");

const root_domain = "pr.link";
const domain = {
  apex: root_domain,
  www: `www.${root_domain}`,
  env_aware: {
    apex: make_domain(root_domain),
    www: make_domain(`www.${root_domain}`)
  }
};

domain.env_aware.whitelisted = [domain.env_aware.apex, domain.env_aware.www];
configs.forEach(page => {
  if (page.whitelist_domain) {
    domain.env_aware.whitelisted.push(make_domain(page.whitelist_domain));
  }

  if (page.vhost) {
    domain.env_aware.whitelisted.push(make_domain(page.vhost));
  }
});

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