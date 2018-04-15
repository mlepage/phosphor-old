// Phosphor - a browser-based microcomputer
// Copyright (c) 2018 Marc Lepage

'use strict';

function draw(list) {
  for (var i = 0; i < list.length; ++i) {
    const item = list[i];
    if (item.visible === false)
      continue;
    const f = item.onDraw;
    if (f)
      f.call(item);
    const children = item.children;
    if (children)
      draw(children);
  }
}

function drawDebug(list, sys) {
  var c = 0; // debug
  for (var i = 0; i < list.length; ++i) {
    const item = list[i];
    if (item.visible === false)
      continue;
    const f = item.onDraw;
    if (f)
      f.call(item);
    sys.rect(item.x, item.y, item.w, item.h, null, c); // debug
    c = (c+1) % 16; // debug
    const children = item.children;
    if (children)
      drawDebug(children, sys); // debug
  }
}

function handle(list, e, func) {
  for (var i = list.length-1; 0 <= i; --i) {
    const item = list[i];
    if (item.visible === false || !hit(e.screenX, e.screenY, item.x, item.y, item.w, item.h))
      continue;
    const children = item.children;
    if (children)
      handle(children, e, func);
    const f = item[func];
    if (f) {
      e.x = e.screenX-item.x, e.y = e.screenY-item.y;
      f.call(item, e);
    }
    return;
  }
}

function hit(ex, ey, x, y, w, h) {
  return x <= ex && ex < x+w && y <= ey && ey < y+h;
}

module.exports = class Ui {

  constructor(list, target) {
    this.list = list;
    if (target && target.sys)
      this.sys = target.sys;
    for (var i = 0; i < list.length; ++i)
      if (list[i].name)
        this[list[i].name] = list[i];
    if (target) {
      target.onCopy = this.onCopy.bind(this);
      target.onCut = this.onCut.bind(this);
      target.onDraw = this.onDraw.bind(this);
      target.onKeyDown = this.onKeyDown.bind(this);
      target.onKeyUp = this.onKeyUp.bind(this);
      target.onPaste = this.onPaste.bind(this);
      target.onPointerDown = this.onPointerDown.bind(this);
      target.onPointerMove = this.onPointerMove.bind(this);
      target.onPointerUp = this.onPointerUp.bind(this);
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
    draw(this.list);
    //drawDebug(this.list, this.sys);
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

  onPaste(e) {
    const item = this._focus;
    if (!item)
      return;
    const f = item.onPaste;
    if (!f)
      return;
    f.call(item, e);
  }

  onPointerDown(e) {
    handle(this.list, e, 'onPointerDown');
  }

  onPointerMove(e) {
    handle(this.list, e, 'onPointerMove');
  }

  onPointerUp(e) {
    handle(this.list, e, 'onPointerUp');
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
