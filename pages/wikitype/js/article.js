function article(url, langcode, title, thumbnail, extract) {
  let node;
  let tokens;
  let word_count;
  let active_token_idx;

  void function $constructor($) {
    node = document.importNode($("#article").content.querySelector("article"), true);
    tokens = node.querySelector(".extract").children;
    word_count = undefined;
    active_token_idx = 0;

    change_dom("title", title);
    change_dom("language", evt.call("extend_language_code", langcode));
    change_dom("thumbnail", thumbnail);
    change_dom("extract", tokenize_extract(extract));
    change_dom("word_count", tokens.length);
    change_dom("mark_active_token");

    word_count = tokens.length;
  }(document.querySelector.bind(document));

// @private
  function get_active_token() {
    return tokens[active_token_idx];
  }

  function decrease_word_count() {
    change_dom("word_count", --word_count);
  }

  function tokenize_extract(extract) {
    const words = extract
      .match(/[^\s]+\s{0,1}/g)
      .map(word => word
        .replace(/\s+/g, "\x20")  // Whitespace
        .replace(/[\u2010-\u2015\u2212]/g, "\x2D")  // Dashes
        .replace(/[\u2018-\u201B]/g, "\x27")  // Single quotation marks
        .replace(/[\u201C-\u201F]/g, "\x22")  // Double quotation marks
      );

    if (words === null)
      throw Error("Error splitting extract.");

    return words.map((word, idx) => {
      const token = document.createElement("span");
      token.classList.add("token");
      token.dataset.word = word;

      return token;
    });
  }

  function select_next_token() {
    if (active_token_idx >= tokens.length - 1)
      return false;

    change_dom("mark_typed_token");
    ++active_token_idx;
    change_dom("mark_active_token");
    return true;
  }

  function change_dom(type, value) {
    switch(type) {
    case "title":
      node.querySelector("h1").textContent = value;
      break;
    case "language":
      node.querySelector("h1").dataset.language = value;
      break;
    case "word_count":
      node.querySelector(".word-count").textContent = value;
      break;
    case "mark_active_token": {
      get_active_token().classList.add("active-token");
      const token_progress = document.createElement("span");
      token_progress.classList.add("progress-token");
      token_progress.dataset.upcoming = get_active_token().dataset.word;
      token_progress.dataset.mistyped = String();
      get_active_token().appendChild(token_progress);
      break; }
    case "mark_typed_token":
      get_active_token().classList.remove("active-token");
      get_active_token().classList.add("typed-token");
      get_active_token().querySelector(".progress-token").remove();
      break;
    case "thumbnail": {
      const thumb = node.querySelector(".thumbnail");
      thumb.classList.add("loading");
      thumb.onload = () => thumb.classList.remove("loading");
      thumb.src = value;
      break; }
    case "extract": {
      const extract_node = node.querySelector(".extract");
      value.forEach(node => extract_node.appendChild(node));
      break; }
    }
  }

// @public
  return {
    node: node,
    url: url,
    decrease_word_count: decrease_word_count,
    get_active_token: get_active_token,
    select_next_token: select_next_token
  }
};