void function article_controller($) {
  let node;
  let articles;
  let active_article_idx;
  let is_loading_article;
  let max_loaded_articles;
  let token_top_guide;

  void function $constructor() {
    node = $(".articles");
    articles = [];
    active_article_idx = 0;
    is_loading_article = false;
    max_loaded_articles = 5;

    evt.emit("lock", "dom", lock => {
      spawn_article(() => {
        get_active_article().node.classList.add("active_article");
        token_top_guide = get_active_article().get_active_token().getBoundingClientRect().top;
        move_active_token_into_view();
        evt.emit("release_lock", "dom", lock);
      });
    });
  }();

// @public
  evt.on({
    "hide_articles": hide_articles,
    "show_articles": show_articles,
    "get_active_token_text": get_active_token_text,
    "set_token_upcoming_text": set_token_upcoming_text,
    "set_token_mistyped_text": set_token_mistyped_text,
    "select_next_token": select_next_token,
    "open_article_in_new_tab": open_article_in_new_tab,
    "move_active_token_into_view": move_active_token_into_view,
    "select_next_article": select_next_article
  });

// @private
  function hide_articles() {
    evt.emit("disable_input_controller");
    node.classList.add("hidden");
  }

  function show_articles() {
    evt.emit("enable_input_controller");
    node.classList.remove("hidden");
  }

  function can_spawn_article() {
    return (
      !is_loading_article &&
      articles.length < max_loaded_articles &&
      active_article_idx === articles.length - 1 ||
      node.getBoundingClientRect().bottom < document.body.getBoundingClientRect().bottom
    );
  }

  function spawn_article(callback = false) {
    if (!can_spawn_article())
      return;

    is_loading_article = true;

    const language_code = evt.call("get_random_language_code");
    evt.emit("get_random_wikipedia_page", language_code, (err, meta) => {
      if (err)
        return void alert(`Couldn't fetch article from Wikipedia, please try again later.\n\n${err}`);

      const random_article = article(
        meta.content_urls.desktop.page,
        meta.lang,
        meta.title,
        meta.thumbnail && meta.thumbnail.source,
        meta.extract || "No extract available."
      );

      node.appendChild(random_article.node);
      articles.push(random_article);

      is_loading_article = false;
      if (callback) callback();
      spawn_article();
    });
  }

  function get_active_article() {
    return articles[active_article_idx];
  }

  function move_active_token_into_view() {
    const node_top = node.getBoundingClientRect().top;
    const active_token_top = get_active_article().get_active_token().getBoundingClientRect().top;

    node.style.top = CSS.px(
      node_top - (active_token_top - token_top_guide)
    );
  }

  function maybe_delete_articles() {
    if (articles.length < 2)
      return;

    const [first, second] = articles.slice(0, 2).map(article => article.node);

    if (second.getBoundingClientRect().bottom < document.body.getBoundingClientRect().top) {
      node.style.top = CSS.px(
        node.getBoundingClientRect().top +
        first.getBoundingClientRect().height +
        second.getBoundingClientRect().height
      );

      articles.shift().node.remove();
      articles.shift().node.remove();

      active_article_idx -= 2;
    }
  }

  function get_active_token_text() {
    return get_active_article().get_active_token().dataset.word;
  }

  function set_token_upcoming_text(text) {
    get_active_article().get_active_token().querySelector(".progress-token").dataset.upcoming = text;
  }

  function set_token_mistyped_text(text) {
    get_active_article().get_active_token().querySelector(".progress-token").dataset.mistyped = text;
  }

  function select_next_token() {
    evt.emit("try_lock", "dom", lock => {
      if (!get_active_article().select_next_token()) {
        evt.emit("release_lock", "dom", lock);
        return void select_next_article();
      }

      get_active_article().decrease_word_count();
      move_active_token_into_view();
      maybe_delete_articles();

      evt.emit("release_lock", "dom", lock);
    });
  }

  function select_next_article() {
    evt.emit("try_lock", "dom", lock => {
      get_active_article().node.classList.remove("active_article");

      if (active_article_idx === articles.length - 1)
        return void spawn_article(() => {
          evt.emit("release_lock", "dom", lock);
          select_next_article();
        });

      ++active_article_idx;
      get_active_article().node.classList.add("active_article");
      move_active_token_into_view();
      maybe_delete_articles();
      spawn_article();

      evt.emit("release_lock", "dom", lock);
    });
  }

  function open_article_in_new_tab() {
    window.open(get_active_article().url);
  }
}(document.querySelector.bind(document));