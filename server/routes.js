const path = require("path");
const { domain, paths } = require("../globals.js");
const configs = require("../configs.js");
const express = require("express");
const fontstack = require("fonts.pr.link");

module.exports = (app) => {
  app.get("/", (req, res) => {
    res.sendFile(path.join(paths.dst, "/frontpage.html"));
  });

  // Page specific routes
  configs.forEach(page => {
    if (page.route)
      app.use("/", page.route(express.Router()));
  });

  // Fonts
  app.use("/fonts", fontstack(domain.env_aware.whitelisted));

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