void function input_controller() {
  let input;
  let shortcuts_node;
  let current_key_is_dead;
  let is_disabled;

  void function $constructor() {
    input = document.querySelector("#stdin");
    shortcuts_node = document.querySelector(".shortcuts");
    current_key_is_dead = false;
    is_disabled = false;

    input.addEventListener("input", handle_input);
    document.body.addEventListener("keydown", onkeydown);

    focus_input();
  }();

// @public
  evt.on({
    "disable_input_controller": disable_input_controller,
    "enable_input_controller": () => is_disabled = false
  });

// @private
  function disable_input_controller() {
    is_disabled = true;
    input.blur();
  }

  function focus_input() {
    if (document.activeElement !== input) {
      input.focus();
    }
  }

  function clear_input() {
    input.value = "";
  }

  function onkeydown(e) {
    if (is_disabled)
      return;

    focus_input();
    current_key_is_dead = (e.key === "Dead");
    handle_shortcut(e);
  }

  function handle_shortcut(kbevt) {
    const key = kbevt.key;
    const ctrl = kbevt.ctrlKey || kbevt.metaKey;
    const shift = kbevt.shiftKey;

    switch(key) {
    case "Tab":
      kbevt.preventDefault();
      evt.emit("select_next_token");
      clear_input();
      break;
    case "Enter":
      kbevt.preventDefault();
      evt.emit("open_article_in_new_tab");
      break;
    }

    if (ctrl) {
      switch(key) {
      case "m":
        kbevt.preventDefault();
        evt.emit("toggle_zen_mode");
        break;
      case "ä":
        kbevt.preventDefault();
        evt.emit("select_next_article");
        clear_input();
        break;
      case "L":
        shift && evt.emit("open_language_selection");
        break;
      case "+":
      case "-":
        kbevt.preventDefault();
        evt.emit("change_font_size", key);
        break;
      case "1":
      case "2":
      case "3":
      case "4":
        kbevt.preventDefault();
        evt.emit("set_theme_by_index", Number(key) - 1);
        break;
      }
    }
  }

  function handle_input(kbevt) {
    const input_txt = input.value;
    const token_txt = evt.call("get_active_token_text");

    // Don't updated on dead key as it will show up as mistyped text.
    if (current_key_is_dead)
      return;

    if (token_txt.indexOf(input_txt) === 0) {
      if (token_txt.length === input_txt.length) {
        evt.emit("select_next_token");
        return void clear_input();
      }

      evt.emit("set_token_upcoming_text", token_txt.substr(input_txt.length));
      evt.emit("set_token_mistyped_text", String());
    } else {
      let correct = String();
      let err = String();

      for (let i = 0; i < input_txt.length; ++i) {
        if (input_txt[i] === token_txt[i]) {
          correct += token_txt[i];
        } else {
          err = input_txt.substr(i);
          break;
        }
      }

      evt.emit("set_token_upcoming_text", token_txt.substr(correct.length));
      evt.emit("set_token_mistyped_text", err);
    }
  }
}();