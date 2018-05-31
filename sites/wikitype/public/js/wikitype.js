"use strict";

const DecodeEntity = entity => {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = entity;

  // TODO: Handle hypens and all sorts of characters that are hard/impossible to type.
  // [ò]
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
      article: document.querySelector("article"),
      article_image: document.querySelector(".article_image")
    }

    // Parsed data
    this.article_tokens;
  
    // Game State
    this.current_token_index;
    this.current_sub_token_index;

    // Load Article
    this.LoadArticle();

    // Add Listener
    document.body.addEventListener("keydown", e => {
      if (e.key.length === 1) this.HandleKeyPress(e.key);
    }, false);

    this.dom.buttons.new_article.addEventListener("click", () => {
      this.LoadArticle();
    }, false);
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
      const img = data.originalimage.source;

      this.InsertContent(title, article, url, img);
      this.SetActiveToken();
    });
  }

  ResetGameState() {
    this.dom.title.innerText = "Loading…";
    this.dom.article.innerText = "Loading article…";
    this.dom.stats.word_count.innerText = "?";
    this.dom.stats.character_count.innerText = "?";
    this.dom.article_image.src = "";

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

    this.dom.title.innerText = title;
    this.dom.title.href = url;
    
    this.dom.article.innerText = "";
    const paragraph = document.createElement("p");
    this.article_tokens.forEach(token => {
      paragraph.appendChild(token);
    });
    this.dom.article.appendChild(paragraph);

    this.dom.stats.word_count.innerText = article.split(/\b/).length;
    this.dom.stats.character_count.innerText = article.length;

    this.dom.article_image.src = img;
  }

  TokenizeArticle(article) {
    return article.split(/\b/)
      .map(word => {
        const token = document.createElement("span");
        const text = document.createTextNode(word);

        token.setAttribute("class", "token");
        token.appendChild(text);

        return token;
      });
  }

  TokenizeWord(word) {
    return word.split(/\B/).map(char => {
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

  HandleKeyPress(key) {
    const current_token = this.article_tokens[this.current_token_index];
    const current_sub_token = current_token.childNodes[this.current_sub_token_index];
    const required_key = current_sub_token.innerText;

    if (key === DecodeEntity(required_key)) {
      current_sub_token.classList.remove("token_active");
      current_sub_token.classList.add("token_typed");
      
      if (this.current_sub_token_index + 1 < current_token.childNodes.length) {
        this.current_sub_token_index++;
      } else {
        if (this.current_token_index + 1 < this.article_tokens.length) {
          this.current_token_index++;
          this.current_sub_token_index = 0;
          this.SetActiveToken();
        } else {
          this.LoadArticle();
        }
      };
    }
  }
}

new Wikitype();