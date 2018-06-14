"use strict";

const MakeEntityTypeable = entity => {
  // Filter out entities that do not require decoding.
  if (/^\w{0,1}$/.test(entity)) {
    return entity;
  }

  const t = document.createElement("textarea");
  let decoded = null;

  t.innerHTML = entity;
  decoded = t.value;

  // Spaces
  if (/\s/.test(decoded)) {
    return "\u0020";
  }

  // Hyphens and dashes
  if (new RegExp([
    "2010",  // HYPHEN
    "2011",  // NON-BREAKING HYPHEN
    "2012",  // FIGURE DASH
    "2013",  // EN DASH
    "2014",  // EM DASH
    "2015",  // HORIZONTAL BAR
    "FE58",  // SMALL EM DASH
    "FE63",  // SMALL HYPHEN-MINUS
    "FF0D"   // FULLWIDTH HYPHEN-MINUS
  ].map(x => `\\u${x}`).join("|")).test(decoded)) {
    return "\u002D";
  }

  // Default
  return decoded;
}

const Wait = ms => new Promise(r => setTimeout(r, ms));

const dom = {
  buttons: {
    new_article: document.querySelector(".new_article"),
    about: document.querySelector(".about")
  },
  history: document.querySelector(".history"),
  input: document.querySelector(".input"),
  article: {
    self: document.querySelector("article"),
    title: document.querySelector(".title"),
    text: document.querySelector(".text"),
    originalimage: document.querySelector("a.originalimage"),
    thumbnail: {
      wrapper: document.querySelector(".thumbnail"),
      el: document.querySelector(".thumbnail img")
    }
  }
};

class Wikitype {
  constructor(dom) {
    // Dom references
    this.dom = dom;

    // Make sure there is at least one character in the textarea
    // that can trigger the `deleteContentBackward' event.
    this.dom.input.value = "d";

    // Transition timings
    this.transition_duration = 200;

    // State
    this.article_tokens;  // Parsed text data
    this.current_token_index;
    this.current_sub_token_index;

    this.AddListener();

    // Capture key inputs
    this.dom.input.focus();

    this.LoadArticle();
  }

  AddListener() {
    document.body.addEventListener("click", () => {
      this.dom.input.focus();
    }, false);

    this.dom.input.addEventListener("input", e => {
      if (!document.body.classList.contains("loading_article")) {
        if (e.data) {
          this.HandleKeyPress(e.data);
        } else if (e.inputType === "deleteContentBackward") {
          // Make sure there is at least one character in the textarea
          // that can trigger the `deleteContentBackward' event
          if (this.dom.input.value.length === 0) {
            this.dom.input.value = "d";
          }

          this.HandleKeyPress(null, true);
        }
      }
    }, false);

    this.dom.buttons.new_article.addEventListener("click", () => {
      if (!document.body.classList.contains("loading_article")) {
        this.LoadArticle();
      }
    }, false);

    this.dom.history.addEventListener("click", e => {
      e.target.dataset.url && this.LoadArticle(e.target.dataset.url);
    }, false);

    this.dom.article.thumbnail.el.onload = () => {
      document.body.classList.remove("fetching_thumbnail");
    }
  }

  LoadArticle(preset_url = null) {
    document.body.classList.add("loading_article");

    this.ResetState();
    this.FetchData(preset_url).then(wiki => {
      if (wiki.err) {
        // TODO: Handle `fetch' error.
        return;
      }

      const title = wiki.title;
      const article = wiki.extract;
      const url = wiki.content_urls.desktop.page;
      const thumbnail = wiki.thumbnail.source || undefined;
      const originalimage = wiki.originalimage.source;
      const api_summary = wiki.api_urls.summary;

      if (!preset_url) {
        this.PushArticleToHistory(thumbnail, api_summary);
      }

      this.article_tokens = this.TokenizeArticle(article);
      this.InsertContent(title, article, url, thumbnail, originalimage);
      this.SetActiveToken();

      document.body.classList.remove("loading_article");
    });
  }

  ResetState() {
    // Fade out article
    document.body.classList.add("switching_article");
    document.body.classList.add("fetching_thumbnail");
    
    // Reset token indexes
    this.current_token_index = 0;
    this.current_sub_token_index = 0;
  }

  FetchData(preset_url) {
    return fetch(preset_url || "random").then(
      res => res.json(),
      err => ({err: err})
    );
  }

  PushArticleToHistory(thumbnail, url) {
    const li = document.createElement("li");
    li.setAttribute("style", `background-image: url(${thumbnail});`);
    li.setAttribute("class", "history_item history_item_inserted");
    li.setAttribute("data-url", url);

    const ref = this.dom.history.insertBefore(li, this.dom.history.firstChild);
    Wait(this.transition_duration).then(() => {
      ref.classList.remove("history_item_inserted");
    });
  }

  InsertContent(title, article, url, thumbnail, originalimage) {
    // Title, Text
    Wait(this.transition_duration).then(() => {
      this.dom.article.title.classList.add("hidden");
      this.dom.article.text.classList.add("hidden");
    }).then(() => Wait(this.transition_duration)).then(() => {
      this.dom.article.text.style.marginTop = 0;

      this.dom.article.title.innerText = title;
      this.dom.article.title.href = url;

      this.dom.article.text.innerText = "";
      this.article_tokens.forEach(token => {
        this.dom.article.text.appendChild(token);
      });

      this.dom.article.title.classList.remove("hidden");
      this.dom.article.text.classList.remove("hidden");
    }).then(() => Wait(10)).then(() => {
      document.body.classList.remove("switching_article");
    });

    // Thumbnail
    if (thumbnail) {
      this.dom.article.thumbnail.el.src = thumbnail;
    }

    // Original image
    this.dom.article.originalimage.href = originalimage;
  }

  TokenizeArticle(article) {
    return article.split(/(\s(?!\s)|(?=\s))/).filter((s, i, a) => {
      return s.length && !(i > 0 && /\s/.test(s) && /\s/.test(a[i - 1]));
    }).map(word => {
      const token = document.createElement("span");
      const text = document.createTextNode(word);

      token.setAttribute("class", "token");
      token.appendChild(text);

      return token;
    });
  }

  TokenizeWord(word) {
    return word.split(/(?=.)/).map(char => {
      const letter = document.createElement("span");
      const text = document.createTextNode(char);

      letter.setAttribute("class", "token token_active");
      letter.appendChild(text);

      return letter;
    });
  }

  SetActiveToken() {
    let active_token = this.article_tokens[this.current_token_index];
    let tokens = this.TokenizeWord(active_token.innerText);
    active_token.innerText = "";

    tokens.forEach(token => {
      active_token.appendChild(token);
    })
  }

  ScrollArticleTo(position) {
    this.dom.article.text.style.marginTop = `-${position}px`;
  }

  FadeOutTokensUntil(token) {
    const tokens = this.article_tokens;

    for (let i = 0; i < tokens.length; ++i) {
      if (token === tokens[i]) {
        break;
      }

      tokens[i].classList.add("hidden");
    }
  }

  HandleKeyPress(key, force) {
    const current_token = this.article_tokens[this.current_token_index];
    const current_sub_token = current_token.childNodes[this.current_sub_token_index];
    const required_key = current_sub_token.innerText;

    if (force || key === MakeEntityTypeable(required_key)) {
      current_sub_token.classList.remove("token_active");
      current_sub_token.classList.add("token_typed");

      if (this.current_sub_token_index + 1 < current_token.childNodes.length) {
        this.current_sub_token_index++;
      } else {
        if (this.current_token_index + 1 < this.article_tokens.length) {
          this.current_token_index++;
          this.current_sub_token_index = 0;
          this.SetActiveToken();

          const next_token = this.article_tokens[this.current_token_index];
          if (current_token.offsetTop !== next_token.offsetTop) {
            this.ScrollArticleTo(next_token.offsetTop);
            this.FadeOutTokensUntil(current_token);
          }
        } else {
          this.LoadArticle();
        }
      };
    }
  }
}

new Wikitype(dom);
