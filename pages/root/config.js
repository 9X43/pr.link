module.exports = {
  name: "root",

  is_root: true,

  route: (router) => {
    const path = require("path");
    const database = require(path.join(global._root, "server", "database.js"));
    const bcrypt = require("bcrypt");
    const express = require("express");

    router.use(express.urlencoded({ extended: true }));
    router.post("/login", (req, res) => {
      const [user, pass] = [req.body.uname, req.body.upass];

      if (!user.length || !pass.length)
        return res.redirect("/login");

      database.query_row("SELECT * FROM users WHERE uname LIKE $1", [user], (err, query_res) => {
        if (err || query_res === undefined)
          return res.redirect("/login");

        bcrypt.compare(pass, query_res.upass, (err, bcrypt_res) => {
          if (err || !bcrypt_res)
            return res.redirect("/login");

          req.session.uname = query_res.uname;
          return res.redirect(
            req.session.return_after_login
            ? req.session.return_after_login
            : "/"
          );
        });
      });
    });

    return router;
  },

  pug_data: {
    get projects() {
      const path = require("path");
      return require(path.join(global._root, "configs.js")).filter(
        page => page.basename !== "root" && page.display_on_frontpage
      );
    }
  }
}
