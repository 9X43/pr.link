"use strict";

const DecodeEntity = entity => {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = entity;

  // TODO: Handle hyphens and all sorts of characters that are hard/impossible to type.
  // Hyphen test article: "https://en.wikipedia.org/api/rest_v1/page/summary/Nitta_Yoshioki"
  return /\s/.test(textarea.value) ? " " : textarea.value;
}

class Wikitype {
  constructor() {
    // Setup DOM references
    this.dom = {
      title: document.querySelector("h1 a"),
      stats: {
        word_count: document.querySelector("li[class$=word_count]"),
        character_count: document.querySelector("li[class$=character_count]")
      },
      buttons: {
        new_article: document.querySelector(".new_article")
      },
      input: document.querySelector(".input"),
      article: document.querySelector("article p"),
      article_image: document.querySelector(".article_image img")
    }

    // Make sure there is at least one character in the textarea
    // that can trigger the `deleteContentBackward' event.
    this.dom.input.value = "d";

    // Parsed data
    this.article_tokens;
  
    // Game state
    this.current_token_index;
    this.current_sub_token_index;

    // Add listener
    document.body.addEventListener("click", _ => {
      this.dom.input.focus();
    }, false);

    this.dom.input.addEventListener("input", e => {
      if (e.data) {
        this.HandleKeyPress(e.data);
      } else if (e.inputType === "deleteContentBackward") {
        // Make sure there is at least one character in the textarea
        // that can trigger the `deleteContentBackward' event.
        if (this.dom.input.value.length === 0) {
          this.dom.input.value = "d";
        }

        this.HandleKeyPress(null, true);
      }
    }, false);

    this.dom.buttons.new_article.addEventListener("click", _ => {
      this.LoadArticle();
    }, false);

    // Load article
    this.LoadArticle();

    // Capture key inputs
    this.dom.input.focus();
  }

  LoadArticle() {
    this.ResetGameState();

    this.FetchData().then(data => {
      if (data.err) {
        // TODO: Handle `fetch' Error.
        return;
      }

      const title = data.title;
      const article = data.extract;
      const url = data.content_urls.desktop.page;
      const img = data.thumbnail.source || undefined;

      this.InsertContent(title, article, url, img);
      this.SetActiveToken();
    });
  }

  ResetGameState() {
    this.dom.title.innerText = "/wikitype";
    this.dom.article.innerText = "Fetching new article…";
    this.dom.stats.word_count.innerText = "?";
    this.dom.stats.character_count.innerText = "?";
    this.dom.article.style.marginTop = 0;

    this.dom.article_image.classList.remove("visible");
    this.dom.article_image.classList.add("hidden");

    this.current_token_index = 0;
    this.current_sub_token_index = 0;
  }

  FetchData() {
    return fetch("random")
      .then(
        res => res.json(),
        err => ({err: err})
      );
  }

  InsertContent(title, article, url, img) {
    this.article_tokens = this.TokenizeArticle(article);

    // Stats
    this.dom.stats.word_count.innerText = article.split(/\b/).length;
    this.dom.stats.character_count.innerText = article.length;
    
    // Title
    this.dom.title.innerText = title;
    this.dom.title.href = url;
    
    // Copy
    this.dom.article.innerText = "";
    this.article_tokens.forEach(token => {
      this.dom.article.appendChild(token);
    });

    // Image
    if (img) {
      this.dom.article_image.classList.remove("visible");
      this.dom.article_image.classList.add("hidden");
      this.dom.article_image.onload = _ => {
        this.dom.article_image.classList.remove("hidden");
        this.dom.article_image.classList.add("visible");
      }
      this.dom.article_image.src = img;
    }
  }

  TokenizeArticle(article) {
    return article.split(/(\s|(?=\s))/)
      .map(word => {
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
    const char_tokens = this.TokenizeWord(active_token.innerText);

    active_token.innerText = "";
    char_tokens.forEach(token => {
      active_token.appendChild(token);
    })
  }

  ScrollArticleBy(amount) {
    let current_amount = /\d+/.exec(this.dom.article.style.marginTop);
    current_amount = current_amount && +current_amount[0] || 0;

    this.dom.article.style.marginTop = `-${current_amount + amount}px`;
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

    if (force || key === DecodeEntity(required_key)) {
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
            this.ScrollArticleBy(current_token.offsetHeight);
            this.FadeOutTokensUntil(current_token);
          }
        } else {
          this.LoadArticle();
        }
      };
    }
  }
}

new Wikitype();