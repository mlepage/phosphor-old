// Simple computer
// Marc Lepage Fall 2017

'use strict';

const Ui = require('./ui.js');

const floor = Math.floor, ceil = Math.ceil;
const min = Math.min, max = Math.max;

module.exports = class MapEditor {

  main() {
    const sys = this.sys;
    
    var mapX = 0; // map origin (cells)
    var mapY = 0; // map origin (cells)
    var mapW = 14; // map size (cells)
    var mapH = 14; // map size (cells)
    var zoom = 3; // 0/1/2/3 zoom is 1/2/48 px tiles
    
    var sheetX = 0; // sheet origin (cells)
    var sheetY = 0; // sheet origin (cells)
    var sheetW = 8; // sheet size (cells)
    var sheetH = 14; // sheet size (cells)
    var sheetWrap = true; // sheet wrap or not
    
    var sprite = 0; // index of selected sprite (0-255)
    
    var mouseDown = false;
    
    const ui = new Ui([
      { // bg
        x: 0, y: 0, w: 192, h: 128,
        onDraw() {
          sys.clear(3);
          sys.rect(0, 0, 192, 7, 11);
          sys.rect(0, 121, 192, 7, 11);
          var str = mapX + ',' + mapY;
          sys.text(str, 0, 121, 5);
          str = ''+sprite;
          sys.text(str, 191-5*str.length, 121, 5);
        },
      },
      { // map
        x: 10, y: 8, w: 112, h: 112, name: 'map',
        onDraw() {
          sys.rect(this.x-1, this.y-1, this.w+2, this.h+2, null, 0);
          if (zoom == 3)
            sys.map(this.x, this.y, mapX, mapY, mapW, mapH);
          else {
            const z = 1<<zoom;
            const w = min(mapW<<(3-zoom), 96);
            const h = min(mapH<<(3-zoom), 96);
            for (var y = 0; y < h; ++y)
              for (var x = 0; x < w; ++x)
                sys.rect(this.x+(x<<zoom), this.y+(y<<zoom), z, z, sys.mget(mapX+x, mapY+y)&0xf);
          }
        },
        onMouseDown(e) {
          mouseDown = true;
          sys.mset(mapX+min(e.x>>zoom, 95), mapY+min(e.y>>zoom, 95), sprite);
        },
        onMouseMove(e) {
          if (mouseDown)
            sys.mset(mapX+min(e.x>>zoom, 95), mapY+min(e.y>>zoom, 95), sprite);
        },
        onMouseUp(e) {
          mouseDown = false;
        },
        onWheel(e) {
          if (e.deltaY <= -1) {
            mapY = max(mapY-(1<<(3-zoom)), 0);
          } else if (e.deltaY >= 1) {
            mapY = min(mapY+(1<<(3-zoom)), max(96-(mapH<<(3-zoom)), 0));
          }
          if (e.deltaX <= -1) {
            mapX = max(mapX-(1<<(3-zoom)), 0);
          } else if (e.deltaX >= 1) {
            mapX = min(mapX+(1<<(3-zoom)), max(96-(mapW<<(3-zoom)), 0));
          }
        },
      },
      { // sheet
        x: 127, y: 8, w: 64, h: 112, name: 'sheet',
        onDraw() {
          // sheet outline
          sys.rect(this.x-1, this.y-1, this.w+2, this.h+2, null, 0);
          // sprites
          var n = sheetY*sheetW+sheetX;
          for (var y = 0; y < sheetH; ++y)
            for (var x = 0; x < sheetW; ++x, ++n)
              sys.spr(n, this.x+(x<<3), this.y+(y<<3));
          // empty sprites
          if (n > 256)
            sys.rect(this.x+this.w-((n-256)<<3), this.y+this.h-8, (n-256)<<3, 8, 0)
          // selected sprite outline
          n = sprite-(sheetY*sheetW+sheetX);
          if (0 <= n && n < sheetH*sheetW) {
            const y = floor(n/sheetW);
            const x = n%sheetW;
            sys.rect(this.x+(x<<3)-1, this.y+(y<<3)-1, 10, 10, null, 15);
          }
        },
        onMouseDown(e) {
          sprite = min((sheetY+(e.y>>3))*sheetW+sheetX+(e.x>>3), 255);
        },
        onWheel(e) {
          if (e.deltaY <= -1) {
            sheetY = max(sheetY-1, 0);
          } else if (e.deltaY >= 1) {
            sheetY = min(sheetY+1, ceil(256/sheetW)-sheetH);
          }
          //if (e.deltaX <= -1) {
          //  sheetx = max(sheetx-1, 0);
          //} else if (e.deltaX >= 1) {
          //  sheetx = min(sheetx+1, 8);
          //}
        },
      },
      { // tool button (draw)
        x: 0, y: 16, w: 10, h: 12,
        onDraw() {
          sys.char(16, 1+this.x, 2+this.y, 10);
        },
        onMouseDown() {
        },
      },
      { // tool button (fill)
        x: 0, y: 28, w: 10, h: 12,
        onDraw() {
          sys.char(17, 1+this.x, 2+this.y, 7);
        },
        onMouseDown() {
        },
      },
      { // tool button (select)
        x: 0, y: 40, w: 10, h: 12,
        onDraw() {
          sys.char(19, 1+this.x, 2+this.y, 7);
        },
        onMouseDown() {
        },
      },
      { // tool button (pan)
        x: 0, y: 52, w: 10, h: 12,
        onDraw() {
          sys.char(20, 1+this.x, 2+this.y, 7);
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
          sys.char(21, 1+this.x, 2+this.y, 7);
        },
        onMouseDown() {
          zoom = max(--zoom, 0);
          mapX = min(mapX, max(96-(mapW<<(3-zoom)), 0));
          mapY = min(mapY, max(96-(mapH<<(3-zoom)), 0));
        },
      },
      { // tool button (zoom in)
        x: 0, y: 88, w: 10, h: 12,
        onDraw() {
          sys.char(22, 1+this.x, 2+this.y, 7);
        },
        onMouseDown() {
          zoom = min(++zoom, 3);
        },
      },
      { // tool button (grid)
        x: 0, y: 100, w: 10, h: 12,
        onDraw() {
          sys.char(23, 1+this.x, 2+this.y, 7);
        },
        onMouseDown() {
        },
      },
      { // splitter button (left)
        x: 122, y: 40, w: 5, h: 12, name: 'split_left',
        onDraw() {
          sys.char(29, this.x, this.y, 7);
        },
        onMouseDown() {
          if (sheetW == 16)
            return;
          sheetW++;
          mapW = 22-sheetW;
          ui.map.w = mapW<<3;
          ui.sheet.w = sheetW<<3;
          ui.sheet.x = 191-ui.sheet.w;
          ui.split_left.x = ui.sheet.x-5;
          ui.split_wrap.x = ui.sheet.x-5;
          ui.split_right.x = ui.sheet.x-5;
          sheetY = min(sheetY, ceil(256/sheetW)-sheetH);
        },
      },
      { // splitter button (wrap)
        x: 122, y: 58, w: 5, h: 12, name: 'split_wrap',
        onDraw() {
          sys.char(30, this.x, this.y, 7);
        },
        onMouseDown() {
        },
      },
      { // splitter button (right)
        x: 122, y: 76, w: 5, h: 12, name: 'split_right',
        onDraw() {
          sys.char(31, this.x, this.y, 7);
        },
        onMouseDown() {
          if (sheetW == 1)
            return;
          sheetW--;
          mapW = 22-sheetW;
          ui.map.w = mapW<<3;
          ui.sheet.w = sheetW<<3;
          ui.sheet.x = 191-ui.sheet.w;
          ui.split_left.x = ui.sheet.x-5;
          ui.split_wrap.x = ui.sheet.x-5;
          ui.split_right.x = ui.sheet.x-5;
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
          sys.char(3, this.x, this.y, 15);
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
