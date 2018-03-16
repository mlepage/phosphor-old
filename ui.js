// Simple computer
// Marc Lepage Winter 2018

'use strict';

function hit(ex, ey, x, y, w, h) {
  return x <= ex && ex < x+w && y <= ey && ey < y+h;
}

module.exports = class Ui {

  constructor(list, target) {
    this.list = list;
    if (target) {
      target.onDraw = this.onDraw.bind(this);
      target.onMouseDown = this.onMouseDown.bind(this);
      target.onMouseWheel = this.onMouseWheel.bind(this);
    }
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

  onMouseDown(e) {
    const ex = e.x, ey = e.y;
    const list = this.list;
    for (var i = 0; i < list.length; ++i) {
      const item = list[i];
      const f = item.onMouseDown;
      if (!f || !hit(ex, ey, item.x, item.y, item.w, item.h))
        continue;
      // TODO should make new event object
      e.x -= item.x;
      e.y -= item.y;
      f.call(item, e);
      break;
    }
  }

  onMouseWheel(e) {
    const ex = e.x, ey = e.y;
    const list = this.list;
    for (var i = 0; i < list.length; ++i) {
      const item = list[i];
      const f = item.onWheel;
      if (!f || !hit(ex, ey, item.x, item.y, item.w, item.h))
        continue;
      if (!this.eWheel)
        this.eWheel = {};
      this.eWheel.x = e.x - item.x;
      this.eWheel.y = e.y - item.y;
      this.eWheel.deltaX = e.deltaX;
      this.eWheel.deltaY = e.deltaY;
      f.call(item, this.eWheel);
      break;
    }
  }

};
