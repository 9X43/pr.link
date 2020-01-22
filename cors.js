function cors(whitelist) {
  if (!Array.isArray(whitelist)) {
    whitelist = [whitelist];
  }

  whitelist = whitelist.map(domain => `https://${domain}`);

  return function(req, res, next) {
    if (req.originalUrl.indexOf(".") === -1)
      return void next();

    const referer = req.headers.referer;

    if (!referer)
      return void next();

    for (let i = 0; i < whitelist.length; ++i) {
      const whitelisted_domain = whitelist[i];

      for (let j = 0; j < whitelisted_domain.length; ++j) {
        if (referer[j] !== whitelisted_domain[j]) {
          break;
        } else if(j === whitelisted_domain.length - 1) {
          res.setHeader("Access-Control-Allow-Origin", whitelisted_domain);
          res.setHeader("Access-Control-Allow-Methods", "GET");
          res.setHeader("Vary", "Origin");
          return void next();
        }
      }
    }

    res.status(403).send(`Hotlinking from \`${req.headers.referer}' is forbidden.`);
  }
}

module.exports = whitelist => cors(whitelist);