void function language_picker($, $$) {
  let node;
  let stdin;
  let language_list_node;
  let default_language_code;
  let checked_language_codes;
  let language_objects;

  void function $constructor() {
    node = $(".language-picker");
    stdin = $(".language-picker input[type='text']");
    language_list_node = $(".languages");
    default_language_code = "en";
    checked_language_codes = [];
    language_objects = Array.from($$(".languages li")).reduce((list, li) => {
      const input = li.querySelector("input");
      const label = li.querySelector("label");
      const language_code = label.dataset.langcode;

      list[language_code] = {
        input: input,
        code: language_code,
        name: label.dataset.langname
      }

      return list;
    }, {});

    update_checked_language_codes();

    stdin.addEventListener("keyup", handle_input);
    language_list_node.addEventListener("click", update_checked_language_codes);
  }();

// @public
  evt.on({
    "get_random_language_code": get_random_language_code,
    "extend_language_code": extend_language_code,
    "open_language_selection": open_language_selection
  });

// @private
  function handle_input(e) {
    if (e.key === "Enter" || e.key === "Escape") {
      if (e.key === "Enter")
        update_checked_language_codes();
      else if (e.key === "Escape")
        reset_changes();

      stdin.value = String();
      node.classList.add("hidden");
      evt.emit("show_articles");
      evt.emit("show_shortcuts");
    } else {
      reset_changes();
      show_changes(stdin.value);
    }
  }

  function reset_changes() {
    Object.values(language_objects).forEach(language => {
      language.input.checked = checked_language_codes.includes(language.code);
    });
  }

  function show_changes(changes) {
    let mode = undefined;
    let lang = String();

    for (let i = 0; i < changes.length; ++i) {
      const c = changes[i];

      switch(c) {
      case "+":
      case "-":
        mode = c;
        break;
      default:
        if (/\s/.test(c))
          break;

        lang += c.toLowerCase();

        if (mode && language_objects[lang]) {
          language_objects[lang].input.checked = (mode === "+");
          lang = String();
        }
      }
    }
  }

  function open_language_selection() {
    evt.emit("hide_articles");
    evt.emit("hide_shortcuts");

    node.classList.remove("hidden");
    stdin.focus();
  }

  function update_checked_language_codes() {
    checked_language_codes = get_checked_language_codes();

    if (checked_language_codes.length === 0) {
      language_objects[default_language_code].input.checked = true;
      update_checked_language_codes();
    }
  }

  function get_checked_language_codes() {
    return Object
      .values(language_objects)
      .filter(language => language.input.checked)
      .map(language => language.code);
  }

  function get_random_language_code() {
    return checked_language_codes[
      Math.floor(Math.random() * checked_language_codes.length)
    ];
  }

  function extend_language_code(code) {
    return language_objects[code].name;
  }
}(document.querySelector.bind(document), document.querySelectorAll.bind(document));