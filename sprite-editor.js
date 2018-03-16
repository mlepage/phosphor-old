// Simple computer
// Marc Lepage Fall 2017

'use strict';

const Ui = require('./ui.js');

const floor = Math.floor;

const customChar = '000000000000000000c644444444c60000c3e7a5e766c3000066e74242e76600000141c5c7e7e70000020202c3e3c10000000000000000000000000000000000020783c1e050300000010204efd7931181c3c3c38181ffff414545d3e300c100000000000000000000c12222af27020077b6777777b67700f7f7d522d5f7f700000080c0e0c08000000080818381800000000183c700000000000000c7830100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';

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
    
    var color = 15; // paint color
    var sprite = 0; // index of selected sprite
    var sheetx = 0; // sheet scroll x
    var sheety = 0; // sheet scroll y
    
    var bg = 3;
    
    this.ui = new Ui([
      { // bg
        x: 0, y: 0, w: 192, h: 128,
        onDraw() {
          sys.clear(bg);
          sys.rect(0, 0, 192, 8, 11);
          sys.rect(0, 120, 192, 8, 11);
          sys.text('sprite '+sprite, 0, this.h-8, 5);
        },
      },
      { // sprite
        x: 13, y: 16, w: 96, h: 96,
        onDraw() {
          sys.rect(this.x-1, this.y-1, this.w+2, this.h+2, undefined, 0);
          for (var y = 0; y < 8; ++y)
            for (var x = 0; x < 8; ++x)
              sys.rect(this.x+x*12, this.y+y*12, 12, 12, sys.sget(sprite, x, y));
        },
        onMouseDown(e) {
          sys.sset(sprite, floor(e.x/12), floor(e.y/12), color);
        },
      },
      { // sheet
        x: 120, y: 48, w: 64, h: 64,
        onDraw() {
          sys.rect(this.x-1, this.y-1, this.w+2, this.h+2, undefined, 0);
          for (var y = 0; y < 8; ++y)
            for (var x = 0; x < 8; ++x)
              sys.spr(((sheety+y)<<4)+(sheetx+x), this.x+(x<<3), this.y+(y<<3));
          const sel = sprite & ~136;
          sys.rect(this.x+((sel&0xf)<<3)-1, this.y+((sel&0xf0)>>1)-1, 10, 10, undefined, 15);
        },
        onMouseDown(e) {
          sprite = ((sheety+(e.y>>3))<<4)+(sheetx+(e.x>>3));
          console.log('selected', sprite);
        },
      },
      { // palette
        x: 120, y: 16, w: 64, h: 16,
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
      { // tool button (pen)
        x:2, y: 18, w: 8, h: 8,
        onDraw() {
          sys.char(8, this.x, this.y, 10);
        },
      },
      { // tool button
        x:2, y: 30, w: 8, h: 8,
        onDraw() {
          sys.char(9, this.x, this.y, 7);
        },
      },
      { // tool button
        x:2, y: 42, w: 8, h: 8,
        onDraw() {
          sys.char(10, this.x, this.y, 7);
        },
      },
      { // tool button
        x:2, y: 54, w: 8, h: 8,
        onDraw() {
          sys.char(11, this.x, this.y, 7);
        },
      },
      { // tool button
        x:2, y: 66, w: 8, h: 8,
        onDraw() {
          sys.char(12, this.x, this.y, 7);
        },
      },
      { // tool button
        x:2, y: 78, w: 8, h: 8,
        onDraw() {
          sys.char(13, this.x, this.y, 7);
        },
        onMouseDown() {
          bg = bg != 3 ? 3 : 7;
        },
      },
      { // tool button
        x:2, y: 90, w: 8, h: 8,
        onDraw() {
          sys.char(14, this.x, this.y, 7);
        },
        onMouseDown() {
          bg = (bg+15)%16;
        },
      },
      { // tool button
        x:2, y: 102, w: 8, h: 8,
        onDraw() {
          sys.char(15, this.x, this.y, 7);
        },
        onMouseDown() {
          bg = (bg+1)%16;
        },
      },
      { // sheet scroll button (left)
        x:128+8, y: 128-16, w: 8, h: 8,
        onDraw() {
          sys.char(16, this.x, this.y, sheetx == 0 ? 10 : 7);
        },
        onMouseDown() {
          sheetx = 0;
          sprite &= ~8;
          console.log('selected', sprite);
        },
      },
      { // sheet scroll button (right)
        x:128+32, y: 128-16, w: 8, h: 8,
        onDraw() {
          sys.char(17, this.x, this.y, sheetx == 8 ? 10 : 7);
        },
        onMouseDown() {
          sheetx = 8;
          sprite |= 8;
          console.log('selected', sprite);
        },
      },
      { // sheet scroll button (up)
        x:192-8, y: 128-64, w: 8, h: 8,
        onDraw() {
          sys.char(18, this.x, this.y, sheety == 0 ? 10 : 7);
        },
        onMouseDown() {
          sheety = 0;
          sprite &= ~128;
          console.log('selected', sprite);
        },
      },
      { // sheet scroll button (down)
        x:192-8, y: 128-40, w: 8, h: 8,
        onDraw() {
          sys.char(19, this.x, this.y, sheety == 8 ? 10 : 7);
        },
        onMouseDown() {
          sheety = 8;
          sprite |= 128;
          console.log('selected', sprite);
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
          for (var n = 0; n < 128; ++n)
            sprite2char(sys, n);
          console.log(sys.memread(0x8000, 32*8));
          console.log(sys.memread(0x8000+32*8, 96*8));
        },
      },
      { // temp button (load ui)
        x:64, y: 128-16, w: 8, h: 8,
        onDraw() {
          sys.text('LU', this.x, this.y+1, 7);
        },
        onMouseDown() {
          // TEMP for working on ui sprites
          //console.log('load: ui --> sheet');
          //sys.memcpy(0x3000+sprite*32, 0x8400+(sprite&0xf)*32, 32);
          //console.log(sys.memread(0x8400+(sprite&0xf)*32, 32));
        },
      },
      { // temp button (save ui)
        x:80, y: 128-16, w: 8, h: 8,
        onDraw() {
          sys.text('SU', this.x, this.y+1, 7);
        },
        onMouseDown() {
          // TEMP for working on ui sprites
          //console.log('save: sheet --> ui');
          //sys.memcpy(0x8400+(sprite&0xf)*32, 0x3000+sprite*32, 32);
          //console.log(sys.memread(0x8400+(sprite&0xf)*32, 32));
        },
      },
      */
      { // menu button (code)
        x:152, y: 0, w: 8, h: 8,
        onDraw() {
          sys.char(1, this.x, this.y, 5);
        },
        onMouseDown() {
          sys.vc(1);
        },
      },
      { // menu button (sprite)
        x:160, y: 0, w: 8, h: 8,
        onDraw() {
          sys.char(2, this.x, this.y, 15);
        },
        onMouseDown() {
          sys.vc(2);
        },
      },
      { // menu button (map)
        x:168, y: 0, w: 8, h: 8,
        onDraw() {
          sys.char(3, this.x, this.y, 5);
        },
        onMouseDown() {
          sys.vc(3);
        },
      },
      { // menu button (sound)
        x:176, y: 0, w: 8, h: 8,
        onDraw() {
          sys.char(4, this.x, this.y, 5);
        },
        onMouseDown() {
          sys.vc(4);
        },
      },
      { // menu button (music)
        x:184, y: 0, w: 8, h: 8,
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
    this.sys.memwrite(0x8000, customChar);
  }

  onSuspend() {
    // HACK directly access memory and filesystem
    this.sys._os.filesystem['mcomputer:mem'] = this.sys.memread(0x3000, 0x5000);
  }

};
