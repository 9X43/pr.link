module.exports = {
  name: "Wikitype",
  description: "Gain (useless) knowledge by typing random Wikipedia articles.",
  keywords: ["Mini Site"],
  created: "SEP 2019",

  display_on_frontpage: true,

  route: router => {
    const request = require("request");

    router.get("/random/:lang", (req, res, next) => {
      const options = {
        url: `https://${req.params.lang}.wikipedia.org/api/rest_v1/page/random/summary`,
        headers: { "User-Agent": "pr.link/project/wikitype (m@pr.link)" }
      };

      request(options, (err, _, body) => {
        if (err) {
          return res.json({ err: err });
        }

        res.json(JSON.parse(body));
      });
    });

    return router;
  },

  pug_data: {
    get languages() {
      return [
        { "code": "en", "language": "English" },
        { "code": "de", "language": "Deutsch" },
      ].sort((a, b) => a.code < b.code ? -1 : a.code > b.code ? 1 : 0);
    }
  }
}
