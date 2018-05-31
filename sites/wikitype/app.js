module.exports = {
  meta: {
    title: "Wikitype",
    description: "Type random Wikipedia articles.",
    languages: "JavaScript",
    links: [
      {
        title: "Start typing!",
        href: "/wikitype"
      }
    ]
  },
  path: "wikitype",
  folder: "wikitype",
  route: app => {
    const request = require("request");

    app.get("/random", (req, res, next) => {
      const options = {
        url: "https://en.wikipedia.org/api/rest_v1/page/random/summary",
        headers: {
          "User-Agent": "pr.link/wikitype (void@ptrckr.me)"
        }
      };

      request(options, (err, _res, body) => {
        if (err) res.json({err: err});

        res.json(JSON.parse(body));
      });
    });

    app.get("/", (req, res, next) => {
      res.render("index");
    });
  }
};
