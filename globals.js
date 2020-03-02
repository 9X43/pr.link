const path = require("path");
const configs = require("./configs.js");

const is_live = process.env.NODE_ENV === "production";
const make_domain = domain => is_live ? domain : domain.replace(/(?<=\.)([^\.]+)$/, "local:8443");

function env_aware_domain(domain, include_port = true) {
  if (is_live)
    return domain;
	else
    return domain.replace(
      /(?<=\.)([^\.]+)$/,
      include_port ? "local:8443" : "local"
    );
}

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
configs.forEach((page) => {
  if (page.vhost)
    domain.env_aware.whitelisted.push(make_domain(page.vhost));
});

module.exports = {
  is_live: is_live,
  env_aware_domain,
  make_domain: make_domain,
  domain: domain,
  paths: {
    root: __dirname,
    src: path.join(__dirname, "pages"),
    dst: path.join(__dirname, "docs"),
    static: path.join(__dirname, "docs", "static")
  }
}