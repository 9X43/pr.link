void function wikipedia_api() {
  const random_article_meta_url = "/wikitype/random/";

// @public
  evt.on("get_random_wikipedia_page", get_random_page);

// @private
  async function get_page(url) {
    const res = await fetch(url).catch(err => { throw err });
    const meta = await res.json();

    if (meta.err)
      throw Error(meta.err.errno);

    return meta;
  }

  function get_random_page(language_code, callback) {
    get_page(random_article_meta_url + language_code)
      .then(meta => callback(false, meta))
      .catch(err => callback(err));
  }
}();