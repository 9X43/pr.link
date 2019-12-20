"use strict";

function measure(node) {
  return node.getBoundingClientRect();
}

measure.top = function(node) {
  return measure(node).top;
}

measure.right = function(node) {
  return measure(node).right;
}

measure.bottom = function(node) {
  return measure(node).bottom;
}

measure.left = function(node) {
  return measure(node).left;
}

measure.center = {};

measure.center.y = function(node) {
  const m = measure(node);

  return m.top + m.height / 2;
}

measure.center.x = function(node) {
  const m = measure(node);

  return m.left + m.width / 2;
}

measure.width = function(node) {
  if (Array.isArray(node)) {
    return node.reduce((acc, n) => acc += measure.width(n), 0);
  }

  return measure(node).width;
}

measure.height = function(node) {
  if (Array.isArray(node)) {
    return node.reduce((acc, n) => acc += measure.height(n), 0);
  }

  return measure(node).height;
}
