// Phosphor - a browser-based microcomputer
// Copyright (c) 2017-2018 Marc Lepage

'use strict';

module.exports = class TextBuffer {

  constructor(text) {
    this.lines = text ? text.split('\n') : [''];
  }

  getText(l0, c0, l1, c1) {
    if (l0 == null)
      return this.lines.join('\n'); // TODO memoize?
    if (l0 == l1)
      return this.lines[l0].slice(c0, c1);
    var str = this.lines[l0].slice(c0);
    for (var l = l0+1; l < l1; ++l)
      str += '\n' + this.lines[l];
    str += '\n' + this.lines[l1].slice(0, c1);
    return str;
  }

  getLine(l) {
    return this.lines[l];
  }

  getLineCount() {
    return this.lines.length;
  }

  // Returns replaced text (with \n, or empty string)
  setText(l0, c0, l1, c1, text) {
    const r = this.getText(l0, c0, l1, c1); // TODO optimize this
    const n = 1 + l1 - l0;
    const prefix = this.lines[l0].slice(0, c0);
    const suffix = this.lines[l1].slice(c1);
    const lines = text.split('\n');
    this.lines.splice(l0, n-lines.length);
    for (var i = lines.length-n; i > 0; --i) {
      this.lines.splice(l0, 0, null);
    }
    for (var i = lines.length-1; i > 0; --i) {
      this.lines[l0+i] = lines[i];
    }
    this.lines[l0] = prefix + lines[0];
    this.lines[l0+lines.length-1] += suffix;
    return r;
  }

};
