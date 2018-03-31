// Phosphor - a browser-based microcomputer
// Copyright (c) 2018 Marc Lepage

'use strict';

function hit(ex, ey, x, y, w, h) {
  return x <= ex && ex < x+w && y <= ey && ey < y+h;
}

module.exports = class Ui {

  constructor(list, target) {
    this.list = list;
    for (var i = 0; i < list.length; ++i)
      if (list[i].name)
        this[list[i].name] = list[i];
    if (target) {
      target.onCopy = this.onCopy.bind(this);
      target.onCut = this.onCut.bind(this);
      target.onDraw = this.onDraw.bind(this);
      target.onKeyDown = this.onKeyDown.bind(this);
      target.onKeyUp = this.onKeyUp.bind(this);
      target.onMouseDown = this.onMouseDown.bind(this);
      target.onMouseMove = this.onMouseMove.bind(this);
      target.onMouseUp = this.onMouseUp.bind(this);
      target.onPaste = this.onPaste.bind(this);
      target.onWheel = this.onWheel.bind(this);
    }
  }

  onCopy(e) {
    const item = this._focus;
    if (!item)
      return;
    const f = item.onCopy;
    if (!f)
      return;
    f.call(item, e);
  }

  onCut(e) {
    const item = this._focus;
    if (!item)
      return;
    const f = item.onCut;
    if (!f)
      return;
    f.call(item, e);
  }

  onDraw() {
    const list = this.list;
    for (var i = 0; i < list.length; ++i) {
      const item = list[i];
      const f = item.onDraw;
      if (f)
        f.call(item);
    }
  }

  onKeyDown(e) {
    const item = this._focus;
    if (!item)
      return;
    const f = item.onKey;
    if (!f)
      return;
    f.call(item, e);
  }

  // TODO not currently called, is it needed?
  onKeyUp(e) {
    const item = this._focus;
    if (!item)
      return;
    const f = item.onKeyUp;
    if (!f)
      return;
    f.call(item, e);
  }

  onMouseDown(e) {
    const list = this.list, ex = e.x, ey = e.y;
    for (var i = 0; i < list.length; ++i) {
      const item = list[i];
      const f = item.onMouseDown;
      if (!f || !hit(ex, ey, item.x, item.y, item.w, item.h))
        continue;
      if (!this._mouse)
        this._mouse = {};
      this._mouse.x = e.x - item.x;
      this._mouse.y = e.y - item.y;
      f.call(item, this._mouse);
      break;
    }
  }

  onMouseMove(e) {
    const list = this.list, ex = e.x, ey = e.y;
    for (var i = 0; i < list.length; ++i) {
      const item = list[i];
      const f = item.onMouseMove;
      if (!f || !hit(ex, ey, item.x, item.y, item.w, item.h))
        continue;
      if (!this._mouse)
        this._mouse = {};
      this._mouse.x = e.x - item.x;
      this._mouse.y = e.y - item.y;
      f.call(item, this._mouse);
      break;
    }
  }

  onMouseUp(e) {
    const list = this.list, ex = e.x, ey = e.y;
    for (var i = 0; i < list.length; ++i) {
      const item = list[i];
      const f = item.onMouseUp;
      if (!f || !hit(ex, ey, item.x, item.y, item.w, item.h))
        continue;
      if (!this._mouse)
        this._mouse = {};
      this._mouse.x = e.x - item.x;
      this._mouse.y = e.y - item.y;
      f.call(item, this._mouse);
      break;
    }
  }

  onPaste(e) {
    const item = this._focus;
    if (!item)
      return;
    const f = item.onPaste;
    if (!f)
      return;
    f.call(item, e);
  }

  onWheel(e) {
    const list = this.list, ex = e.x, ey = e.y;
    for (var i = 0; i < list.length; ++i) {
      const item = list[i];
      const f = item.onWheel;
      if (!f || !hit(ex, ey, item.x, item.y, item.w, item.h))
        continue;
      if (!this._wheel)
        this._wheel = {};
      this._wheel.x = e.x - item.x;
      this._wheel.y = e.y - item.y;
      this._wheel.deltaX = e.deltaX;
      this._wheel.deltaY = e.deltaY;
      f.call(item, this._wheel);
      break;
    }
  }

};
