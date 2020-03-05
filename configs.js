const fs = require("fs");
const path = require("path");
const paths = require("./global/paths.js");
const { env_aware_domain } = require("./global/utils.js");

const default_config = {
  // Path
  full_path: String(),  // autofilled
  basename: String(),  // autofilled

  // Meta
  name: String(),
  description: String(),
  keywords: Array(),
  created: String(),

  // Preview
  preview: String("img/preview.jpg"),
  preview_type: String(),  // autofilled

  // Flags
  is_root: Boolean(false),
  display_on_frontpage: Boolean(false),

  // Express
  has_routes: Boolean(),  // autofilled
  route: Function(),
  vhost: String(),

  // Data
  pug_data: Object()
}

function load_config(base) {
  const config_path = path.join(base, "config.js");

  if (!fs.existsSync(config_path))
    throw Error(`Config not found at ${config_path}.`);

  return build_config(config_path);
}

function build_config(config_path) {
  let config = require(config_path);

  assert_keys(config, config_path);
  assert_types(config, config_path);

  config = Object.assign(clone(default_config), config);
  config.full_path = path.dirname(config_path);
  config.basename = path.basename(config.full_path);
  config.preview_type = /\.mp4$/.test(config.preview) ? "video" : "image";
  config.has_routes = !!config.route.length;
  if (config.vhost) config.vhost = env_aware_domain(config.vhost, false);

  return config;
}

function assert_keys(config, config_path) {
  const invalid_keys = Object.keys(config).filter((k) => {
    return !default_config.hasOwnProperty(k);
  });

  if (invalid_keys.length > 0)
    throw Error(
      `Found ${invalid_keys.length} (${invalid_keys.join(", ")}) ` +
      `invalid key(s) at ${config_path}.`
    );
}

function assert_types(config, config_path) {
  const invalid_types = Object.keys(config).filter((k) => {
    const user_type = Object.prototype.toString.call(config[k]);
    const expected_type = Object.prototype.toString.call(default_config[k]);

    return expected_type !== user_type;
  });

  if (invalid_types.length > 0)
    throw Error(
      `Found ${invalid_types.length} (${invalid_types.join(", ")}) ` +
      `invalid type(s) at ${config_path}.`
    );
}

function clone(obj) {
  if (Object.prototype.toString.call(obj) === "[object Array]")
    return obj.reduce((c, v) => c.concat(clone(v)), Array());

  if (Object.prototype.toString.call(obj) === "[object Object]")
    return Object.keys(obj).reduce((c, k) => {
      c[k] = clone(obj[k]);
      return c;
    }, Object());

  return obj;
}

module.exports = fs
  .readdirSync(paths.src, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => path.join(paths.src, dirent.name))
  .map(page => load_config(page))
  .sort((a, b) => new Date(b.created) - new Date(a.created));