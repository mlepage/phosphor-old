// Simple computer
// Marc Lepage Fall 2017

'use strict';

const floor = Math.floor;

const CANVASX = 16;
const CANVASY = 16;
const PALETTEX = 144;
const PALETTEY = 16;
const SHEETX = 0;
const SHEETY = 128-4*8-7;

module.exports = class SpriteEditor {

  main() {
    this.data = new Uint8Array(24*4 * 8*8);
    this.color = 15;
    this.paint = false;
    this.spritex = 0;
    this.spritey = 0;
  }

  // ---------------------------------------------------------------------------

  onDraw() {
    this.sys.gclear(7);
    this.sys.grect(0, 0, 192, 7, 3);
    this.sys.grect(0, 128-7, 192, 7, 3);
    this.sys.gtext('SPRITE EDITOR (UNDER CONSTRUCTION)', 0, 0, 15);
    
    var i, x, y;
    
    // palette
    this.sys.grecto(PALETTEX-1, PALETTEY-1, 4*8+2, 4*8+2, 0);
    for (y = 0; y != 4; ++y) {
      for (x = 0; x != 4; ++x) {
        this.sys.grect(PALETTEX + 8*x, PALETTEY + 8*y, 8, 8, 4*y + x);
      }
    }
    x = PALETTEX+8*(this.color%4);
    y = PALETTEY+8*floor(this.color/4);
    this.sys.grecto(x, y, 8, 8, 15);
    this.sys.grecto(x-1, y-1, 8+2, 8+2, 0);
    
    // sheet
    i = 0;
    for (y = 0; y != 32; ++y) {
      for (x = 0; x != 192; ++x) {
        this.sys.gpixel(SHEETX + x, SHEETY + y, this.data[i++]);
      }
    }
    this.sys.grecto(SHEETX+this.spritex*8, SHEETY+this.spritey*8, 8, 8, 15);
    
    // sprite
    this.sys.grecto(CANVASX-1, CANVASY-1, 8*8+2, 8*8+2, 0);
    for (y = 0; y != 8; ++y) {
      for (x = 0; x != 8; ++x) {
        i = i = (this.spritey*8+y)*192 + this.spritex*8 + x;
        this.sys.grect(CANVASX + 8*x, CANVASY + 8*y, 8, 8, this.data[i]);
      }
    }
  }

  onKeyDown(e) {
  }

  onMouseDown(e) {
    if (CANVASX <= e.x && e.x < CANVASX + 8*8 && CANVASY <= e.y && e.y < CANVASY + 8*8) {
      const x = floor((e.x - CANVASX) / 8);
      const y = floor((e.y - CANVASY) / 8);
      const i = (this.spritey*8+y)*192 + this.spritex*8 + x;
      this.data[i] = this.color;
      this.paint = true;
    }
    if (PALETTEX <= e.x && e.x < PALETTEX + 4*8 && PALETTEY <= e.y && e.y < PALETTEY + 4*8) {
      const x = floor((e.x - PALETTEX) / 8);
      const y = floor((e.y - PALETTEY) / 8);
      this.color = y*4 + x;
    }
    if (SHEETX <= e.x && e.x < SHEETX + 24*8 && SHEETY <= e.y && e.y < SHEETY + 4*8) {
      this.spritex = floor((e.x - SHEETX) / 8);
      this.spritey = floor((e.y - SHEETY) / 8);
    }
  }

  onMouseMove(e) {
    if (!this.paint) return;
    if (CANVASX <= e.x && e.x < CANVASX + 8*8 && CANVASY <= e.y && e.y < CANVASY + 8*8) {
      const x = floor((e.x - CANVASX) / 8);
      const y = floor((e.y - CANVASY) / 8);
      const i = (this.spritey*8+y)*192 + this.spritex*8 + x;
      this.data[i] = this.color;
    }
  }

  onMouseUp(e) {
    this.paint = false;
  }

  onMouseWheel(e) {
  }

};
