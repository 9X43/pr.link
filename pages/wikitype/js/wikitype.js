"use strict";

class Wikitype {
  constructor() {
    this.dom = {
      stdin: document.querySelector("#stdin"),
      body: document.body,
      articles: document.querySelector(".articles")
    };

    this.classes = {
      active_article: "active_article"
    };

    this.guide_y = undefined;

    this.state = {
      active_article_index: 0,
      loading_article: false
    };

    this.default = {
      max_loaded_articles: 5
    };

    this.spawn_article()
      .then(this.mark_active_article.bind(this))
      .then(this.maybe_autotype.bind(this))
      .then(this.maybe_spawn_article.bind(this))
      .then(() => {
        if (!this.guide_y) {
          this.guide_y = measure.top(this.active_token);
        }
      })
      .catch(() => {});

    this.add_listener();
  }

  maybe_spawn_article() {
    if (this.state.loading_article) return;

    if (measure.bottom(this.dom.articles) < measure.bottom(this.dom.body) &&
        this.dom.articles.childNodes.length < this.default.max_loaded_articles) {
      this.spawn_article().then(this.maybe_spawn_article.bind(this));
    }
  }

  spawn_article() {
    this.state.loading_article = true;
    return WikipediaApi.fetch_random(language_picker.get_random_checked_language_code())
      .then(data => Article.from(data))
      .then(article => {
        this.dom.articles.appendChild(article.node);
        this.state.loading_article = false;
      })
      .catch(err => {
        alert("Could not load article from Wikipedia, please try again later.");
        throw err;
      });
  }

  maybe_remove_article() {
    const articles = this.dom.articles.childNodes;

    if (articles.length < 2) return;

    const first = articles[0];
    const second = articles[1];

    if (measure.bottom(second) < measure.top(this.dom.body)) {
      const height_to_remove = measure.height([first, second]);
      const top = measure.top(this.dom.articles) + height_to_remove;

      this.dom.articles.style.top = (CSS && CSS.px) ? CSS.px(top) : `${top}px`;

      first.remove();
      second.remove();

      this.state.active_article_index -= 2;
    }
  }

  add_listener() {
    this.dom.body.addEventListener("keydown", e => {
      if (document.activeElement !== this.dom.stdin) {
        this.dom.stdin.focus();
      }

      this.handle_shortcut(e.key, e.ctrlKey, e);
      this.maybe_spawn_article();
      this.maybe_remove_article();
    });

    this.dom.stdin.addEventListener("input", e => {
      if (e.data) {
        if (e.data === this.active_token.dataset.value.substr(0, 1) /* is_correct_char(e.data) */) {
          this.select_next_char();
        }
      }
    }, false);
  }

  handle_shortcut(key, ctrl, event) {
    // User Shortcuts
    switch(key) {
      case "Escape":
        this.select_next_char();
        break;
      case "Tab":
        event.preventDefault();
        this.select_next_article();
        break;
      case "Enter":
        this.open_article_in_new_tab()
        break;
      case "z":
        if (ctrl) {
          document.documentElement.classList.toggle("zen-mode");
        }
        break;
    }

    // Debug Options
    if (ctrl) {
      switch(key) {
        case "c":
          this.select_next_char();
          break;
        case "w":
          this.select_next_token();
          break;
        case "a":
          this.select_next_article();
          break;
      }
    }
  }

  select_next_char() {
    this.active_token.dataset.value = this.active_token.dataset.value.substr(1);

    if (!this.active_token.dataset.value.length) {
      if (this.active_token.dataset.last) {
        this.select_next_article();
      } else {
        this.select_next_token();
      }
    } else {
      this.maybe_autotype();
    }
  }

  maybe_autotype() {
    if (!is_typeable(this.active_token.dataset.value, Article.from(this.active_article).lang)) {
      this.select_next_char();
    };
  }

  select_next_token() {
    // Reduce Word Count
    Article.from(this.active_article).word_count = { decrease: 1 };

    const current_token = this.active_token;
    current_token.classList.add("typed-token");
    current_token.classList.remove("active-token");

    const new_token = this.active_article.querySelector(`[data-index="${Number(current_token.dataset.index) + 1}"]`);
    new_token.classList.add("active-token");
    new_token.dataset.value = new_token.dataset.text;

    this.maybe_autotype();
    this.move_active_token_into_view();
  }

  mark_active_article() {
    if (this.dom.articles.childNodes[this.state.active_article_index - 1]) {
      this.dom.articles.childNodes[this.state.active_article_index - 1].classList.remove(this.classes.active_article);
    }

    this.active_article.classList.add(this.classes.active_article);
  }

  select_next_article() {
    if (this.dom.articles.childNodes[this.state.active_article_index + 1]) {
      this.state.active_article_index++;
      this.mark_active_article();

      this.maybe_autotype();
      this.move_active_token_into_view();
    } else {
      // If the current article is bigger than the window, maybe_spawn_article
      // won't trigger, so hitting tab to skip the current article won't do anything.
      this.spawn_article(this.select_next_article.bind(this));
    }
  }

  move_active_token_into_view() {
    const top = measure.top(this.dom.articles) - (measure.top(this.active_token) - this.guide_y);

    this.dom.articles.style.top =
      (CSS && CSS.px) ? CSS.px(top) : `${top}px`;
  }

  open_article_in_new_tab() {
    window.open(Article.from(this.active_article).url);
  }

  get active_article() {
    return this.dom.articles.childNodes[this.state.active_article_index];
  }

  get active_token() {
    if (!this.active_article) {
      throw new Error(`"this.active_article" is not defined: ${this.active_article}`);
    }

    return this.active_article.querySelector(".active-token");
  }
}
