"use strict";

function is_typeable(str, lang) {
  switch(lang) {
    case "en":
    case "de":
      if (/[^\u0020-\u007E]/.test(str.substr(0, 1))) {
        return false;
      }
      break;

    default:
      throw new Error(`Unsupported language: ${lang}.`);
      break;
  }

  return true;
}
