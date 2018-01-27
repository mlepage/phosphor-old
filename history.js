// Simple computer
// Marc Lepage Fall 2017

'use strict';

module.exports = class History {

  constructor() {
    this.clear();
  }

  clear() {
    this.list = [];
    this.list[1] = {line:''};
    this.i = 1;
    this.i0 = 1;
    this.i1 = 1;
  }

  commit() {
    if (this.i != this.i1) {
      this.list[this.i1].line = this.list[this.i].line;
      if (this.list[this.i].orig != undefined) {
        this.list[this.i].line = this.list[this.i].orig;
        delete this.list[this.i].orig;
      }
    }
  }

  get(i) {
    return this.list[i||this.i].line;
  }

  max() {
    return this.i1;
  }

  min() {
    return this.i0;
  }

  modified(i) {
    return this.list[i||this.i].orig == undefined ? false : true;
  }

  new() {
    this.i = ++this.i1;
    this.list[this.i] = {line:''};
  }

  next() {
    return this.i == this.i1 ? false : (++this.i, true);
  }

  prev() {
    return this.i == this.i0 ? false : (--this.i, true);
  }

  set(line) {
    if (this.i != this.i1 && this.list[this.i].orig == undefined) {
      this.list[this.i].orig = this.list[this.i].line;
    }
    this.list[this.i].line = line;
  }

};
