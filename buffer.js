// Phosphor - a browser-based microcomputer
// Copyright (c) 2017-2018 Marc Lepage

'use strict';

const pos = require('./pos');

module.exports = class TextBuffer {

  constructor(text) {
    this.lines = text ? text.split('\n') : [''];
    this.markers = [];
    this.nextMarkerId = 0;
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

  getLines() {
    return this.lines; // TODO copy/freeze?
  }

  getLine(row) {
    return this.lines[row];
  }

  getLineCount() {
    return this.lines.length;
  }

  posDown(pos, col) {
    var len;
    if (pos[0] == this.lines.length-1) {
      len = this.lines[pos[0]].length;
      if (pos[1] == len) return false;
      pos[1] = len;
      return true;
    }
    len = this.lines[++pos[0]].length;
    if (col) pos[1] = col;
    if (pos[1] > len) pos[1] = len;
    return true;
  }

  posLeft(pos) {
    if (pos[0] == 0 && pos[1] == 0) return false;
    if (--pos[1] < 0) pos[1] = this.lines[--pos[0]].length;
    return true;
  }

  posRight(pos) {
    const len = this.lines[pos[0]].length;
    if (pos[0] == this.lines.length-1 && pos[1] == len) return false;
    if (++pos[1] > len) { pos[1] = 0; ++pos[0]; }
    return true;
  }

  posUp(pos, col) {
    if (pos[0] == 0) {
      if (pos[1] == 0) return false;
      pos[1] = 0;
      return true;
    }
    const len = this.lines[--pos[0]].length;
    if (col) pos[1] = col;
    if (pos[1] > len) pos[1] = len;
    return true;
  }

  posSet(pos, row, col) {
    const pos0 = pos[0], pos1 = pos[1];
    pos[0] = row; pos[1] = col;
    if (pos[0] < 0) pos[0] = 0;
    else if (this.lines.length-1 < pos[0]) pos[0] = this.lines.length-1;
    const len = this.lines[pos[0]].length;
    if (pos[1] < 0) pos[1] = 0;
    else if (len < pos[1]) pos[1] = len;
    return pos[0] != pos0 || pos[1] != pos1;
  }

  // Returns number of new lines created
  setText(r0, c0, r1, c1, text) {
    const n = 1 + r1 - r0;
    const prefix = this.lines[r0].slice(0, c0);
    const suffix = this.lines[r1].slice(c1);
    const lines = text.split('\n');
    const r = lines.length-1;
    this.lines.splice(r0, n-lines.length);
    for (var i = lines.length-n; i > 0; --i) {
      this.lines.splice(r0, 0, null);
    }
    for (var i = lines.length-1; i > 0; --i) {
      this.lines[r0+i] = lines[i];
    }
    this.lines[r0] = prefix + lines[0];
    this.lines[r0+lines.length-1] += suffix;
    for (const marker of this.markers) {
      // TODO
    }
    return r;
  }

  append(text) {
    const r = this.getLineCount()-1;
    const c = this.getLine(r).length;
    const end = [r, c];
    this.setText([end, end], text);
  }

  insert(position, text) {
    this.setText([position, position], text);
  }

  deleteRows(start, end) {
    this.setText([[start, 0], [end, this.lines[end].length]], '');
  }

  markPosition(position) {
    const marker = { id: this.nextMarkerId++, position: pos.clone(position) }
    this.markers[marker.id] = marker;
    console.log(this.markers);
    return marker;
  }

  markRange(range) {
    const marker = { range: [ [range[0][0], range[0][1]], [range[1][0], range[1][1]] ] };
    return marker;
  }

  setMarkerPosition(marker, position) {
    marker.position[0] = position[0];
    marker.position[1] = position[1];
  }

};
