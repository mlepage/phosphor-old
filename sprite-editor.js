// Simple computer
// Marc Lepage Fall 2017

'use strict';

const Ui = require('./ui.js');

const floor = Math.floor, ceil = Math.ceil;
const min = Math.min, max = Math.max;

function sprite2char(sys, n) {
  var a = 0x8000+(n<<3);
  for (var y = 0; y < 8; ++y) {
    var b = 0;
    for (var x = 0; x < 8; ++x) {
      const c = sys.sget(n, x, y);
      if (c)
        b |= (1<<x);
    }
    sys.poke(a++, b);
  }
}

function char2sprite(sys, n) {
  var a = 0x8000+(n<<3);
  for (var y = 0; y < 8; ++y) {
    var b = sys.peek(a++);
    for (var x = 0; x < 8; ++x, b>>>=1) {
      const c = (b&1)*15
      sys.sset(n, x, y, c);
    }
  }
}

module.exports = class SpriteEditor {

  main() {
    const sys = this.sys;
    
    var sheetX = 0; // sheet origin (cells)
    var sheetY = 0; // sheet origin (cells)
    var sheetW = 8; // sheet size (cells)
    var sheetH = 8; // sheet size (cells)
    var sheetWrap = false; // sheet wrap or not
    
    var color = 15; // paint color
    var sprite = 0; // index of selected sprite
    var sheetx = 0; // sheet scroll x
    var sheety = 0; // sheet scroll y
    
    var mouseDown = false;
    
    var bg = 3;
    
    const ui = new Ui([
      { // bg
        x: 0, y: 0, w: 192, h: 128,
        onDraw() {
          sys.clear(3);
          sys.rect(0, 0, 192, 7, 11);
          sys.rect(0, 121, 192, 7, 11);
          var str = ''+sprite;
          sys.text(str, 191-5*str.length, 121, 5);
        },
      },
      { // canvas
        x: 12, y: 16, w: 96, h: 96,
        onDraw() {
          sys.rect(this.x-1, this.y-1, this.w+2, this.h+2, null, 0);
          for (var y = 0; y < 8; ++y)
            for (var x = 0; x < 8; ++x)
              sys.rect(this.x+x*12, this.y+y*12, 12, 12, sys.sget(sprite, x, y));
        },
        onMouseDown(e) {
          mouseDown = true;
          sys.sset(sprite, floor(e.x/12), floor(e.y/12), color);
        },
        onMouseMove(e) {
          if (mouseDown)
            sys.sset(sprite, floor(e.x/12), floor(e.y/12), color);
        },
        onMouseUp(e) {
          mouseDown = false;
        },
      },
      { // sheet
        x: 119, y: 48, w: 64, h: 64,
        onDraw() {
          // sheet outline
          sys.rect(this.x-1, this.y-1, this.w+2, this.h+2, null, 0);
          // sprites
          for (var y = 0; y < sheetH; ++y)
            for (var x = 0; x < sheetW; ++x)
              sys.spr(((sheetY+y)<<4)+(sheetX+x), this.x+(x<<3), this.y+(y<<3));
          // selected sprite outline
          x = (sprite&0xf)-sheetX;
          y = (sprite>>4)-sheetY;
          if (0 <= x && x < 8 && 0 <= y && y < 8) {
            sys.rect(this.x+(x<<3)-1, this.y+(y<<3)-1, 10, 10, null, 15);
          }
        },
        onMouseDown(e) {
          sprite = (sheetY+(e.y>>3))*16+sheetX+(e.x>>3);
        },
        onWheel(e) {
          if (e.deltaY <= -1) {
            sheetY = max(sheetY-1, 0);
          } else if (e.deltaY >= 1) {
            sheetY = min(sheetY+1, 8);
          }
          if (e.deltaX <= -1) {
            sheetX = max(sheetX-1, 0);
          } else if (e.deltaX >= 1) {
            sheetX = min(sheetX+1, 8);
          }
        },
      },
      { // palette
        x: 119, y: 16, w: 64, h: 16,
        onDraw() {
          sys.rect(this.x-1, this.y-1, this.w+2, this.h+2, undefined, 0);
          for (var c = 0; c < 16; ++c)
            sys.rect(this.x+((c&0x7)<<3), this.y+(c&0x8), 8, 8, c);
          sys.rect(this.x+((color&0x7)<<3)-1, this.y+(color&0x8)-1, 10, 10, undefined, 15);
          if (color == 15)
            sys.rect(this.x+((color&0x7)<<3), this.y+(color&0x8), 8, 8, undefined, 3);
        },
        onMouseDown(e) {
          color = (e.y&0x8)+(e.x>>3);
        },
      },
      { // tool button (draw)
        x: 0, y: 16, w: 12, h: 12,
        onDraw() {
          sys.char(16, 2+this.x, 2+this.y, 10);
        },
        onMouseDown() {
        },
      },
      { // tool button (fill)
        x: 0, y: 28, w: 12, h: 12,
        onDraw() {
          sys.char(17, 2+this.x, 2+this.y, 7);
        },
        onMouseDown() {
        },
      },
      { // tool button (select)
        x: 0, y: 40, w: 12, h: 12,
        onDraw() {
          sys.char(19, 2+this.x, 2+this.y, 7);
        },
        onMouseDown() {
        },
      },
      { // tool button (pan)
        x: 0, y: 52, w: 12, h: 12,
        onDraw() {
          sys.char(20, 2+this.x, 2+this.y, 7);
        },
        onMouseDown() {
        },
      },
      { // tool button
        x: 0, y: 64, w: 10, h: 12,
        onDraw() {
          //sys.char(0, 1+this.x, 2+this.y, 7);
        },
        onMouseDown() {
        },
      },
      { // tool button (zoom out)
        x: 0, y: 76, w: 10, h: 12,
        onDraw() {
          //sys.char(21, 1+this.x, 2+this.y, 7);
        },
        onMouseDown() {
        },
      },
      { // tool button (zoom in)
        x: 0, y: 88, w: 10, h: 12,
        onDraw() {
          //sys.char(22, 1+this.x, 2+this.y, 7);
        },
        onMouseDown() {
        },
      },
      { // tool button (grid)
        x: 0, y: 100, w: 10, h: 12,
        onDraw() {
          //sys.char(23, 1+this.x, 2+this.y, 7);
        },
        onMouseDown() {
        },
      },
/*
      { // temp button (load chars)
        x:16, y: 128-16, w: 8, h: 8,
        onDraw() {
          sys.text('LC', this.x, this.y+1, 7);
        },
        onMouseDown() {
          // TEMP for working on chars
          console.log('load: chars --> sheet');
          window.editCharset = true;
          for (var n = 0; n < 128; ++n)
            char2sprite(sys, n);
          console.log(sys.memread(0x8000, 32*8));
          console.log(sys.memread(0x8000+32*8, 96*8));
        },
      },
      { // temp button (save chars)
        x:32, y: 128-16, w: 8, h: 8,
        onDraw() {
          sys.text('SC', this.x, this.y+1, 7);
        },
        onMouseDown() {
          // TEMP for working on chars
          console.log('save: sheet --> chars');
          window.editCharset = true;
          for (var n = 0; n < 128; ++n)
            sprite2char(sys, n);
          console.log(sys.memread(0x8000, 32*8));
          console.log(sys.memread(0x8000+32*8, 96*8));
        },
      },
*/
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
          sys.char(2, this.x, this.y, 15);
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
          sys.char(5, this.x, this.y, 5);
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

  onSuspend() {
    this.sys.save();
  }

};
