"use strict";

class WikipediaApi {
  static fetch(url) {
    return fetch(url)
    .then(res => res.json())
    .then(json => {
      if (json.err) {
        throw new Error(json);
      }

      return json;
    })
    .catch(err => {
      throw err;
    });
  }

  static fetch_random(lang) {
    return WikipediaApi.fetch(`https://DYNAMIC_ROOT/wikitype/random/${lang}`);
  }
}
