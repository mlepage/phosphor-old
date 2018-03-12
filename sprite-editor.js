// Simple computer
// Marc Lepage Fall 2017

'use strict';

const Ui = require('./ui.js');

const floor = Math.floor;

module.exports = class SpriteEditor {

  main() {
    const sys = this.sys;
    
    var color = 15; // paint color
    var sprite = 0; // sprite index

    this.ui = new Ui([
      { // bg
        x: 0, y: 0, w: 192, h: 128,
        onDraw() {
          sys.gclear(3);
          sys.grect(0, 0, 192, 8, 11);
          sys.grect(0, 120, 192, 8, 11);
        },
      },
      { // sprite
        x: 13, y: 16, w: 96, h: 96,
        onDraw() {
          sys.grecto(this.x-1, this.y-1, this.w+2, this.h+2, 0);
          for (var y = 0; y < 8; ++y)
            for (var x = 0; x < 8; ++x)
              sys.grect(this.x+x*12, this.y+y*12, 12, 12, sys.sget(sprite, x, y));
        },
        onMouseDown(e) {
          sys.sset(sprite, floor(e.x/12), floor(e.y/12), color);
        },
      },
      { // sheet
        x: 120, y: 48, w: 64, h: 64,
        onDraw() {
          sys.grecto(this.x-1, this.y-1, this.w+2, this.h+2, 0);
          for (var y = 0; y < 8; ++y)
            for (var x = 0; x < 8; ++x)
              sys.spr((y<<4)+x, this.x+(x<<3), this.y+(y<<3));
          sys.grecto(this.x+((sprite&0xf)<<3)-1, this.y+((sprite&0xf0)>>1)-1, 10, 10, 15);
        },
        onMouseDown(e) {
          sprite = ((e.y&0xf8)<<1)+(e.x>>3);
        },
      },
      { // palette
        x: 120, y: 16, w: 64, h: 16,
        onDraw() {
          sys.grecto(this.x-1, this.y-1, this.w+2, this.h+2, 0);
          for (var c = 0; c < 16; ++c)
            sys.grect(this.x+((c&0x7)<<3), this.y+(c&0x8), 8, 8, c);
          sys.grecto(this.x+((color&0x7)<<3)-1, this.y+(color&0x8)-1, 10, 10, 15);
          if (color == 15)
            sys.grecto(this.x+((color&0x7)<<3), this.y+(color&0x8), 8, 8, 3);
        },
        onMouseDown(e) {
          color = (e.y&0x8)+(e.x>>3);
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
      { // tool button (draw)
        x:2, y: 18, w: 8, h: 8,
        onDraw() {
          sys.grect(this.x, this.y, this.w, this.h, 7);
        },
      },
      { // tool button
        x:2, y: 30, w: 8, h: 8,
        onDraw() {
          sys.grect(this.x, this.y, this.w, this.h, 7);
        },
      },
      { // tool button
        x:2, y: 42, w: 8, h: 8,
        onDraw() {
          sys.grect(this.x, this.y, this.w, this.h, 7);
        },
      },
      { // tool button
        x:2, y: 54, w: 8, h: 8,
        onDraw() {
          sys.grect(this.x, this.y, this.w, this.h, 7);
        },
      },
      { // tool button
        x:2, y: 66, w: 8, h: 8,
        onDraw() {
          sys.grect(this.x, this.y, this.w, this.h, 7);
        },
      },
      { // tool button
        x:2, y: 78, w: 8, h: 8,
        onDraw() {
          sys.grect(this.x, this.y, this.w, this.h, 7);
        },
      },
      { // tool button
        x:2, y: 90, w: 8, h: 8,
        onDraw() {
          sys.grect(this.x, this.y, this.w, this.h, 7);
        },
      },
      { // tool button
        x:2, y: 102, w: 8, h: 8,
        onDraw() {
          sys.grect(this.x, this.y, this.w, this.h, 7);
        },
      },
      { // scroll button
        x:128+8+2, y: 128-16+2, w: 5, h: 5,
        onDraw() {
          sys.grect(this.x, this.y, this.w, this.h, 7);
        },
      },
      { // scroll button
        x:128+32+2, y: 128-16+2, w: 5, h: 5,
        onDraw() {
          sys.grect(this.x, this.y, this.w, this.h, 7);
        },
      },
      { // scroll button
        x:192-8+2, y: 128-64+2, w: 5, h: 5,
        onDraw() {
          sys.grect(this.x, this.y, this.w, this.h, 7);
        },
        onMouseDown() {
          // TEMP for working on ui sprites
          //console.log('save ui sprite');
          //sys.memcpy(0x8000+(sprite&0xf)*32, 0x3000+sprite*32, 32);
          //console.log(sys.memread(0x8000+(sprite&0xf)*32, 32));
        },
      },
      { // scroll button
        x:192-8+2, y: 128-40+2, w: 5, h: 5,
        onDraw() {
          sys.grect(this.x, this.y, this.w, this.h, 7);
        },
        onMouseDown() {
          // TEMP for working on ui sprites
          //console.log('load ui sprite');
          //sys.memcpy(0x3000+sprite*32, 0x8000+(sprite&0xf)*32, 32);
          //console.log(sys.memread(0x8000+(sprite&0xf)*32, 32));
        },
      },
    ], this);
  }

  // ---------------------------------------------------------------------------

  onResume() {
  }

  onSuspend() {
    // HACK directly access memory and filesystem
    this.sys._os.filesystem['mcomputer:mem'] = this.sys.memread(0x3000, 0x5000);
  }

};
