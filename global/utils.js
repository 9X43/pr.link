const is_live = process.env.NODE_ENV === "production";

function env_aware_domain(domain, include_port = true) {
  if (is_live)
    return domain;
	else
    return domain.replace(
      /(?<=\.)([^\.]+)$/,
      include_port ? "local:8443" : "local"
    );
}

module.exports = { is_live, env_aware_domain };