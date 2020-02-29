module.exports = {
  name: "Wikitype",
  description: "Gain (useless) knowledge by typing random Wikipedia articles.",
  keywords: ["Mini Site"],
  created: "FEB 2020",

  display_on_frontpage: true,

  route: router => {
    const request = require("request");

    router.get("/wikitype/random/:lang", (req, res, next) => {
      const options = {
        url: `https://${req.params.lang}.wikipedia.org/api/rest_v1/page/random/summary`,
        headers: { "User-Agent": "pr.link/wikitype (m@pr.link)" }
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
        { "code": "bg", "language": "Български" },
        { "code": "hr", "language": "Hrvatski" },
        { "code": "cs", "language": "Čeština" },
        { "code": "da", "language": "Dansk" },
        { "code": "nl", "language": "Nederlands" },
        { "code": "en", "language": "English" },
        { "code": "et", "language": "Eesti" },
        { "code": "fi", "language": "Suomi" },
        { "code": "fr", "language": "Français" },
        { "code": "de", "language": "Deutsch" },
        { "code": "el", "language": "Ελληνικά" },
        { "code": "hu", "language": "Magyar" },
        { "code": "ga", "language": "Gaeilge" },
        { "code": "it", "language": "Italiano" },
        { "code": "lv", "language": "Latviešu" },
        { "code": "lt", "language": "Lietuvių" },
        { "code": "mt", "language": "Malti" },
        { "code": "pl", "language": "Polski" },
        { "code": "pt", "language": "Português" },
        { "code": "ro", "language": "Română" },
        { "code": "sk", "language": "Slovenčina" },
        { "code": "sl", "language": "Slovenščina" },
        { "code": "es", "language": "Español" },
        { "code": "sv", "language": "Svenska" }
      ].sort((a, b) => a.code < b.code ? -1 : a.code > b.code ? 1 : 0);
    }
  }
}
