"use strict";

class Article {
  constructor(obj) {
    if (obj instanceof Node) {
      this.root = obj;
    } else {
      this.root = document.importNode(Article.template.content, true);

      this.url = obj.content_urls.desktop.page;
      this.lang = obj.lang;
      this.title = obj.title;
      this.thumbnail = (obj.thumbnail && obj.thumbnail.source) || "";
      this.extract = obj.extract;
    }

    return this;
  }

  static from(obj) {
    return new Article(obj);
  }

  get node() {
    return this.root;
  }

  set url(url) {
    this.root.querySelector("article").dataset.url = url;
  }

  get url() {
    return this.root.dataset.url;
  }

  set lang(lang) {
    this.root.querySelector("article").dataset.lang = lang;
    this.root.querySelector("h1").dataset.language = language_picker.extend_language_code(lang);
  }

  get lang() {
    return this.root.dataset.lang;
  }

  set title(str) {
    this.root.querySelector("h1").textContent = str;
  }

  set thumbnail(url) {
    let thumbnail = this.root.querySelector(".thumbnail");

    thumbnail.classList.add("loading");
    thumbnail.onload = () => {
      thumbnail.classList.remove("loading");
    }
    thumbnail.src = url;
  }

  set extract(extract) {
    const node = document.createElement("p");
    node.innerHTML = extract.replace(/\s+/g, "\x20");

    Article.tokenize_extract(node);

    this.word_count = node.querySelector("span").children.length;

    this.root.querySelector(".extract").appendChild(node);
  }

  set word_count(count) {
    if (count.hasOwnProperty("decrease")) {
      this.root.querySelector(".word-count").textContent = this.word_count - count.decrease;
    } else {
      this.root.querySelector(".word-count").textContent = count;
    }
  }

  get word_count() {
    return Number(this.root.querySelector(".word-count").textContent);
  }
}

// TODO:
// Split language specific
// Marcus_Whitman: Contains a line break.

Article.tokenize_extract = (root, node_index = { val: 0 }, is_root = true) => {
	let nodes = root.childNodes;

	for (let i = 0; i < nodes.length; i++) {
		let node = nodes[i];

		if (node.nodeType === Node.TEXT_NODE) {
      let container = document.createElement("span");
			let text_nodes = node.textContent
        .split(/([^\s]+\s)/)
        .filter(str => str.length);

			text_nodes.forEach(text => {
				let span = document.createElement("span");

        if (node_index.val === 0) {
          span.classList.add("active-token");
          span.setAttribute("data-value", text);
        }

        span.classList.add("token");
				span.setAttribute("data-index", node_index.val++);
        span.setAttribute("data-text", text);
				span.appendChild(document.createTextNode(text));
				container.appendChild(span);
			});

      node.parentNode.insertBefore(container, node);
      node.remove();
		} else {
			Article.tokenize_extract(node, node_index, false);
		}
	}

	if (is_root) {
		root.querySelector(`[data-index="${node_index.val - 1}"]`).dataset.last = true;
  }
}

Article.template = document.querySelector("#article");
