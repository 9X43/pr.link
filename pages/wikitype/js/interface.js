void function interface(html) {
  let themes;
  let articles_wrapper;
  let shortcuts_node;

  void function $constructor() {
    themes = ["dark", "light", "sepia", "gb"];
    articles_wrapper = document.querySelector("main.articles");
    shortcuts_node = document.querySelector(".shortcuts");
  }();

// @public
  evt.on({
    "toggle_zen_mode": toggle_zen_mode,
    "set_theme_by_index": set_theme_by_index,
    "change_font_size": change_font_size,
    "show_shortcuts": () => shortcuts_node.classList.remove("hidden"),
    "hide_shortcuts": () => shortcuts_node.classList.add("hidden")
  });

// @private
  function toggle_zen_mode(force) {
    if (force === undefined)
      html.classList.toggle("zen-mode");
    else
      html.classList.toggle("zen-mode", force);
  }

  function change_font_size(modifier) {
    const current_size = articles_wrapper.style.fontSize;

    articles_wrapper.style.fontSize = current_size.replace(
      /(\d*(?:\.\d*)?)/,
      (size) => {
        return modifier === "+"
          ? Number(size) + .1
          : Number(size) - .1;
      }
    );

    evt.emit("lock", "dom", lock => {
      evt.emit("move_active_token_into_view");
      evt.emit("release_lock", "dom", lock);
    });
  }

  function set_theme_by_index(idx) {
    const theme = themes[idx];
    const theme_regexp = new RegExp(`(?:${themes.join("|")})(?=-theme)`);

    if (theme)
      html.className = html.className.replace(theme_regexp, theme);
  }
}(document.documentElement);