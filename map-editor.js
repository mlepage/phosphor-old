// Simple computer
// Marc Lepage Fall 2017

'use strict';

const Ui = require('./ui.js');

const min = Math.min, max = Math.max;

// TODO scrub out all but the first 8 chars
const customChar = '000000000000000000c644444444c60000c3e7a5e766c3000066e74242e76600000141c5c7e7e70000020202c3e3c10000000000000000000000000000000000020783c1e050300000010204efd7931181c3c3c38181ffff414545d3e300c100000000000000000000c12222af27020077b6777777b67700f7f7d522d5f7f700000080c0e0c08000000080818381800000000183c700000000000000c7830100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';

module.exports = class MapEditor {

  main() {
    const sys = this.sys;
    
    var sprite = 0; // index of selected sprite
    var mapx = 0; // map scroll x
    var mapy = 0; // map scroll y
    var sheetx = 0; // sheet scroll x
    var sheety = 0; // sheet scroll y
    
    this.ui = new Ui([
      { // bg
        x: 0, y: 0, w: 192, h: 128,
        onDraw() {
          sys.clear(3);
          sys.rect(0, 0, 192, 8, 11);
          sys.rect(0, 120, 192, 8, 11);
        },
      },
      { // map
        x: 12, y: 8, w: 112, h: 112,
        onDraw() {
          sys.map(this.x, this.y, mapx, mapy, 14, 14);
          sys.rect(this.x, this.y, this.w, this.h, null, 0);
        },
        onMouseDown(e) {
          sys.mset(mapx+(e.x>>3), mapy+(e.y>>3), sprite);
        },
        onWheel(e) {
          if (e.deltaY <= -1) {
            mapy = max(mapy-1, 0);
          } else if (e.deltaY >= 1) {
            mapy = min(mapy+1, 82);
          }
          if (e.deltaX <= -1) {
            mapx = max(mapx-1, 0);
          } else if (e.deltaX >= 1) {
            mapx = min(mapx+1, 82);
          }
        },
      },
      { // sheet
        x: 128, y: 8, w: 64, h: 112,
        onDraw() {
          for (var y = 0; y < 14; ++y)
            for (var x = 0; x < 8; ++x)
              sys.spr(((sheety+y)<<4)+(sheetx+x), this.x+(x<<3), this.y+(y<<3));
          // TODO fix this drawing
          const sel = sprite & ~136;
          sys.rect(this.x+((sel&0xf)<<3)-1, this.y+((sel&0xf0)>>1)-1, 10, 10, undefined, 15);
        },
        onMouseDown(e) {
          sprite = ((sheety+(e.y>>3))<<4)+(sheetx+(e.x>>3));
          console.log('selected', sprite);
        },
        onWheel(e) {
          if (e.deltaY <= -1) {
            sheety = max(sheety-1, 0);
          } else if (e.deltaY >= 1) {
            sheety = min(sheety+1, 2);
          }
          if (e.deltaX <= -1) {
            sheetx = max(sheetx-1, 0);
          } else if (e.deltaX >= 1) {
            sheetx = min(sheetx+1, 8);
          }
        },
      },
      { // tool button (pen)
        x:2, y: 18, w: 8, h: 8,
        onDraw() {
          sys.char(8, this.x, this.y, 10);
        },
        onMouseDown() {
          --mapx;
          console.log('map', mapx, mapy);
        },
      },
      { // tool button
        x:2, y: 30, w: 8, h: 8,
        onDraw() {
          sys.char(9, this.x, this.y, 7);
        },
        onMouseDown() {
          ++mapx;
          console.log('map', mapx, mapy);
        },
      },
      { // tool button
        x:2, y: 42, w: 8, h: 8,
        onDraw() {
          sys.char(10, this.x, this.y, 7);
        },
        onMouseDown() {
          --mapy;
          console.log('map', mapx, mapy);
        },
      },
      { // tool button
        x:2, y: 54, w: 8, h: 8,
        onDraw() {
          sys.char(11, this.x, this.y, 7);
        },
        onMouseDown() {
          ++mapy;
          console.log('map', mapx, mapy);
        },
      },
      { // tool button
        x:2, y: 66, w: 8, h: 8,
        onDraw() {
          sys.char(12, this.x, this.y, 7);
        },
        onMouseDown() {
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
          sys.char(2, this.x, this.y, 5);
        },
        onMouseDown() {
          sys.vc(2);
        },
      },
      { // menu button (map)
        x:168, y: 0, w: 8, h: 8,
        onDraw() {
          sys.char(3, this.x, this.y, 15);
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

};
