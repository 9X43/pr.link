const path = require("path");
const root = path.dirname(__dirname);

module.exports = {
  root,
  src: path.join(root, "pages"),
  dst: path.join(root, "docs"),
  static: path.join(root, "docs", "static")
};