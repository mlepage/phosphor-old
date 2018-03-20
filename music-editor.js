// Simple computer
// Marc Lepage Fall 2017

'use strict';

const Ui = require('./ui.js');

module.exports = class MusicEditor {

  main() {
    const sys = this.sys;
    
    const ui = new Ui([
      { // bg
        x: 0, y: 0, w: 192, h: 128,
        onDraw() {
          sys.clear(3);
          sys.rect(0, 0, 192, 7, 11);
          sys.rect(0, 121, 192, 7, 11);
          const str = 'MUSIC EDITOR UNDER CONSTRUCTION';
          sys.text(str, 96-(str.length*5)/2, 64, 11);
        },
      },
      { // menu button (menu)
        x: 0, y: 0, w: 8, h: 9,
        onDraw() {
          sys.char(6, this.x, this.y, 5);
        },
        onMouseDown() {
        },
      },
      { // menu button (undo)
        x: 16, y: 0, w: 8, h: 9,
        onDraw() {
          sys.char(7, this.x, this.y, 5);
        },
        onMouseDown() {
        },
      },
      { // menu button (redo)
        x: 24, y: 0, w: 8, h: 9,
        onDraw() {
          sys.char(8, this.x, this.y, 5);
        },
        onMouseDown() {
        },
      },
      { // menu button (cut)
        x: 40, y: 0, w: 8, h: 9,
        onDraw() {
          sys.char(9, this.x, this.y, 5);
        },
        onMouseDown() {
        },
      },
      { // menu button (copy)
        x: 48, y: 0, w: 8, h: 9,
        onDraw() {
          sys.char(10, this.x, this.y, 5);
        },
        onMouseDown() {
        },
      },
      { // menu button (paste)
        x: 56, y: 0, w: 8, h: 9,
        onDraw() {
          sys.char(11, this.x, this.y, 5);
        },
        onMouseDown() {
        },
      },
      { // menu button (code)
        x: 152, y: 0, w: 8, h: 8,
        onDraw() {
          sys.char(1, this.x, this.y, 5);
        },
        onMouseDown() {
          sys.vc(1);
        },
      },
      { // menu button (sprite)
        x: 160, y: 0, w: 8, h: 8,
        onDraw() {
          sys.char(2, this.x, this.y, 5);
        },
        onMouseDown() {
          sys.vc(2);
        },
      },
      { // menu button (map)
        x: 168, y: 0, w: 8, h: 8,
        onDraw() {
          sys.char(3, this.x, this.y, 5);
        },
        onMouseDown() {
          sys.vc(3);
        },
      },
      { // menu button (sound)
        x: 176, y: 0, w: 8, h: 8,
        onDraw() {
          sys.char(4, this.x, this.y, 5);
        },
        onMouseDown() {
          sys.vc(4);
        },
      },
      { // menu button (music)
        x: 184, y: 0, w: 8, h: 8,
        onDraw() {
          sys.char(5, this.x, this.y, 15);
        },
        onMouseDown() {
          sys.vc(5);
        },
      },
    ], this);
  }

  // ---------------------------------------------------------------------------

  onResume() {
    this.sys.memwrite(0x8000, '00221408142200000036222222360000001c2a3e3e2a0000003636003636000000080c2c3c3e0000001010101c1c0000007c007c007c00000010087c081000000010207c20100000002828106c6c0000003c7c4c4c78000000787c64643c0000000000000000000000000000000000000000000000000000000000000000000010387c3e1d090700102040fe7d391100000000000000000055004100410055001454547d7f7e3c007f41415d41417f007f41495d49417f007f557f557f557f00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040604000000000404040400000000040c0400');
  }

};
