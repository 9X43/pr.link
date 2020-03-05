const path = require("path");
const domain = require("../global/domains.js");
const paths = require("../global/paths.js");
const configs = require("../configs.js");
const express = require("express");
const vhost = require("vhost");
const fontstack = require("fonts.pr.link");

module.exports = (app) => {
  // Page specific routes
  configs.forEach((page) => {
    if (page.has_routes)
      app.use("/", page.route(express.Router()));

    if (page.vhost)
      app.use(vhost(page.vhost, (req, res) => {
        let url = `https://${domain.apex}/${page.basename}`;

        if (req.path !== "/")
          url += req.path;

        res.redirect(301, url);
      }));
  });

  // Frontpage
  app.get("/", (req, res) => {
    res.sendFile(path.join(paths.dst, "/frontpage.html"));
  });

  // Fonts
  app.use("/fonts", fontstack(domain.apex));

  // Static files
  app.use("/", express.static(paths.dst, {
    redirect: false,
    index: false,
    extensions: ["html"]
  }));

  // 404
  app.get("*", (req, res) => {
    res.status(404).end();
  });
}