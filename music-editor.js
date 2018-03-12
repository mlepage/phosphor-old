// Simple computer
// Marc Lepage Fall 2017

'use strict';

const Ui = require('./ui.js');

module.exports = class MusicEditor {

  main() {
    const sys = this.sys;
    
    this.ui = new Ui([
      { // bg
        x: 0, y: 0, w: 192, h: 128,
        onDraw() {
          sys.gclear(3);
          sys.grect(0, 0, 192, 8, 11);
          sys.grect(0, 120, 192, 8, 11);
        },
      },
      { // menu button (code)
        x:152, y: 0, w: 8, h: 8,
        onDraw() {
          sys.uspr(1, this.x, this.y);
        },
        onMouseDown() {
          sys.vc(1);
        },
      },
      { // menu button (sprite)
        x:160, y: 0, w: 8, h: 8,
        onDraw() {
          sys.uspr(2, this.x, this.y);
        },
        onMouseDown() {
          sys.vc(2);
        },
      },
      { // menu button (map)
        x:168, y: 0, w: 8, h: 8,
        onDraw() {
          sys.uspr(3, this.x, this.y);
        },
        onMouseDown() {
          sys.vc(3);
        },
      },
      { // menu button (sound)
        x:176, y: 0, w: 8, h: 8,
        onDraw() {
          sys.uspr(4, this.x, this.y);
        },
        onMouseDown() {
          sys.vc(4);
        },
      },
      { // menu button (music)
        x:184, y: 0, w: 8, h: 8,
        onDraw() {
          sys.uspr(5, this.x, this.y);
        },
        onMouseDown() {
          sys.vc(5);
        },
      },
    ], this);
  }

  // ---------------------------------------------------------------------------

};
