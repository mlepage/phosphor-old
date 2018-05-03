// Phosphor - a browser-based microcomputer
// Copyright (c) 2017-2018 Marc Lepage

'use strict';

const Action = require('./action.js');
const Ui = require('./nui.js');

const abs = Math.abs;
const floor = Math.floor, ceil = Math.ceil;
const min = Math.min, max = Math.max;

function clamp(val, min, max) {
  return val < min ? min : max < val ? max : val;
}

const zoom = [];
zoom[12] = { out: 6 };
zoom[6] = { out: 4, in: 12 };
zoom[4] = { out: 3, in: 6 };
zoom[3] = { out: 2, in: 4 };
zoom[2] = { out: 1, in: 3 };
zoom[1] = { in: 2 };

module.exports = class SpriteEditor {

  main() {
    const sys = this.sys;
    
    let tool = 'draw';
    let color = 15;
    
    // canvas
    let cz = 12; // zoom scale (1, 2, 3, 4, 6, 12)
    let cn = 96/cz; // width/height (pixels)
    let cx = 0, cy = 0; // top left (pixels)
    
    // sheet
    let sx = 0, sy = 0; // top left (cells)
    
    // -------------------------------------------------------------------------
    
    const am = new Action(redo, undo, merge);
    
    function merge(a0, a1) {
      if (typeof(a1) == 'number' && (a1&0x1000000)) {
        a1 &= 0xffffff;
        if (typeof(a0) == 'number')
          return (((a0>>4)&0xf) == (a0&0xf)) ? a1 : [ a0, a1 ];
        else
          return a0.push(a1), a0;
      } else if (typeof(a0) == 'number' && (((a0>>4)&0xf) == (a0&0xf)))
        return a1;
      // TODO still one minor annoyance: if you draw a pixel same color as before,
      // it will be replaced after next action, but until then, it can undo/redo
      // (without having visible action, and without matching later undo/redo
      // sequence after it has been merged)
    }
    
    function redo(a) {
      if (typeof(a) == 'number')
        sset((a>>8)&0x7f, (a>>16)&0x7f, a&0xf);
      else
        for (let i = 0, n = a[i]; i < a.length; ++i, n = a[i])
          sset((n>>8)&0x7f, (n>>16)&0x7f, n&0xf);
    }
    
    function undo(a) {
      if (typeof(a) == 'number')
        sset((a>>8)&0x7f, (a>>16)&0x7f, (a>>4)&0xf);
      else
        for (let i = 0, n = a[i]; i < a.length; ++i, n = a[i])
          sset((n>>8)&0x7f, (n>>16)&0x7f, (n>>4)&0xf);
    }
    
    // -------------------------------------------------------------------------
    
    function draw(x, y, c, move) {
      const t = sget(x, y);
      if (t != c || !move)
        am.do((move?0x1000000:0)|(y<<16)|(x<<8)|(t<<4)|c);
    }
    
    function fill(x, y, c) {
      const t = sget(x, y);
      if (t == c)
        return;
      const m = 0x1000000|(t<<4)|c;
      let n = (y<<16)|(x<<8)|(t<<4)|c;
      am.do(n);
      const q = [n];
      while (q.length) {
        n = q.shift();
        x = (n>>8)&0x7f;
        y = (n>>16)&0x7f;
        --y;
        if (cy <= y && sget(x, y) == t)
          n = (y<<16)|(x<<8)|m, am.do(n), q.push(n);
        ++y, --x;
        if (cx <= x && sget(x, y) == t)
          n = (y<<16)|(x<<8)|m, am.do(n), q.push(n);
        x += 2;
        if (x < cx+cn && sget(x, y) == t)
          n = (y<<16)|(x<<8)|m, am.do(n), q.push(n);
        --x, ++y;
        if (y < cy+cn && sget(x, y) == t)
          n = (y<<16)|(x<<8)|m, am.do(n), q.push(n);
      }
    }
    
    function sget(x, y) {
      return sys.sget(((y&~7)<<1)+(x>>3), x&7, y&7);
    }
    
    function sset(x, y, c) {
      sys.sset(((y&~7)<<1)+(x>>3), x&7, y&7, c);
    }
    
    // -------------------------------------------------------------------------
    
    const ui = new Ui([
      {
        name: 'bg',
        x: 0, y: 0, w: 192, h: 128,
        onDraw() {
          sys.clear(3);
          sys.rect(0, 0, 192, 7, 11);
          sys.rect(0, 121, 192, 7, 11);
        },
      },
      {
        name: 'titlebar',
        x: 0, y: 0, w: 192, h: 8,
        children: [
          {
            name: 'menu',
            x: 0, y: 0, w: 8, h: 8,
            onDraw() {
              sys.char(0, this.x, this.y, 5);
            },
            onPointerDown() {
              ui.menu.visible = !ui.menu.visible;
            },
          },
          {
            name: 'undo',
            x: 16, y: 0, w: 8, h: 8,
            onDraw() {
              sys.char(6, this.x, this.y, 5);
            },
            onPointerDown() {
              am.undo();
            },
          },
          {
            name: 'redo',
            x: 24, y: 0, w: 8, h: 8,
            onDraw() {
              sys.char(7, this.x, this.y, 5);
            },
            onPointerDown() {
              am.redo();
            },
          },
          {
            name: 'cut',
            x: 40, y: 0, w: 8, h: 8,
            onDraw() {
              sys.char(8, this.x, this.y, 5);
            },
            onPointerDown() {
              alert('not yet implemented');
            },
          },
          {
            name: 'copy',
            x: 48, y: 0, w: 8, h: 8,
            onDraw() {
              sys.char(9, this.x, this.y, 5);
            },
            onPointerDown() {
              alert('not yet implemented');
            },
          },
          {
            name: 'paste',
            x: 56, y: 0, w: 8, h: 8,
            onDraw() {
              sys.char(10, this.x, this.y, 5);
            },
            onPointerDown() {
              alert('not yet implemented');
            },
          },
          {
            name: 'code',
            x: 152, y: 0, w: 8, h: 8,
            onDraw() {
              sys.char(1, this.x, this.y, 5);
            },
            onPointerDown() {
              sys.vc(1);
            },
          },
          {
            name: 'sprite',
            x: 160, y: 0, w: 8, h: 8,
            onDraw() {
              sys.char(2, this.x, this.y, 15);
            },
          },
          {
            name: 'map',
            x: 168, y: 0, w: 8, h: 8,
            onDraw() {
              sys.char(3, this.x, this.y, 5);
            },
            onPointerDown() {
              sys.vc(3);
            },
          },
          {
            name: 'sound',
            x: 176, y: 0, w: 8, h: 8,
            onDraw() {
              sys.char(4, this.x, this.y, 5);
            },
            onPointerDown() {
              sys.vc(4);
            },
          },
          {
            name: 'music',
            x: 184, y: 0, w: 8, h: 8,
            onDraw() {
              sys.char(5, this.x, this.y, 5);
            },
            onPointerDown() {
              sys.vc(5);
            },
          },
        ],
      },
      {
        name: 'toolbar',
        x: 0, y: 16, w: 12, h: 96,
        children: [
          {
            name: 'draw',
            x: 0, y: 16, w: 12, h: 12,
            onDraw() {
              sys.char(16, 2+this.x, 2+this.y, tool == 'draw' ? 10 : 7);
            },
            onPointerDown() {
              tool = 'draw';
            },
          },
          {
            name: 'fill',
            x: 0, y: 28, w: 12, h: 12,
            onDraw() {
              sys.char(17, 2+this.x, 2+this.y, tool == 'fill' ? 10 : 7);
            },
            onPointerDown() {
              tool = 'fill';
            },
          },
          {
            name: 'stamp',
            x: 0, y: 40, w: 12, h: 12,
            onDraw() {
              sys.char(18, 2+this.x, 2+this.y, tool == 'stamp' ? 10 : 7);
            },
            onPointerDown() {
              alert('not yet implemented');
              //tool = 'stamp';
            },
          },
          {
            name: 'select',
            x: 0, y: 52, w: 12, h: 12,
            onDraw() {
              sys.char(19, 2+this.x, 2+this.y, tool == 'select' ? 10 : 7);
            },
            onPointerDown() {
              alert('not yet implemented');
              //tool = 'select';
            },
          },
          {
            name: 'pan',
            x: 0, y: 64, w: 12, h: 12,
            onDraw() {
              sys.char(20, 2+this.x, 2+this.y, tool == 'pan' ? 10 : 7);
            },
            onPointerDown() {
              alert('not yet implemented');
              //tool = 'pan';
            },
          },
          {
            name: 'zoomin',
            x: 0, y: 76, w: 12, h: 12,
            onDraw() {
              sys.char(21, 2+this.x, 2+this.y, 7);
            },
            onPointerDown() {
              if (cz == 12)
                return;
              cz = zoom[cz].in, cn = 96/cz;
            },
          },
          {
            name: 'zoomout',
            x: 0, y: 88, w: 12, h: 12,
            onDraw() {
              sys.char(22, 2+this.x, 2+this.y, 7);
            },
            onPointerDown() {
              if (cz == 1)
                return;
              cz = zoom[cz].out, cn = 96/cz;
              cx = min(cx, 128-cn), cy = min(cy, 128-cn);
            },
          },
          {
            name: 'grid',
            x: 0, y: 100, w: 12, h: 12,
            onDraw() {
              sys.char(23, 2+this.x, 2+this.y, 7);
            },
            onPointerDown() {
              alert('not yet implemented');
            },
          },
        ],
      },
      {
        name: 'palette',
        x: 119, y: 16, w: 64, h: 16,
        onDraw() {
          sys.rect(this.x-1, this.y-1, this.w+2, this.h+2, undefined, 0);
          for (let c = 0; c < 16; ++c)
            sys.rect(this.x+((c&0x7)<<3), this.y+(c&0x8), 8, 8, c);
          sys.rect(this.x+((color&0x7)<<3)-1, this.y+(color&0x8)-1, 10, 10, undefined, 15);
          if (color == 15)
            sys.rect(this.x+((color&0x7)<<3), this.y+(color&0x8), 8, 8, undefined, 3);
        },
        onPointerDown(e) {
          color = (e.y&0x8)+(e.x>>3);
        },
      },
      {
        name: 'sheet',
        x: 119, y: 48, w: 64, h: 64,
        onDraw() {
          sys.rect(this.x-1, this.y-1, this.w+2, this.h+2, null, 0);
          for (let i = 0, y = sy; i < 8; ++i, ++y)
            for (let j = 0, x = sx; j < 8; ++j, ++x)
              sys.sprite((y<<4)+x, this.x+(j<<3), this.y+(i<<3));
          let x = cx-(sx<<3);
          let y = cy-(sy<<3);
          let x0 = clamp(x-1, -1, 64);
          let y0 = clamp(y-1, -1, 64);
          let x1 = clamp(x+cn+1, 0, 65);
          let y1 = clamp(y+cn+1, 0, 65);
          sys.rect(this.x+x0, this.y+y0, x1-x0, y1-y0, null, 15);
        },
        onPointerDown(e) {
          cx = min((sx+(e.x>>3))<<3, 128-cn);
          cy = min((sy+(e.y>>3))<<3, 128-cn);
        },
        onPointerMove(e) {
          if ((e.buttons&1) == 0)
            return;
          cx = min((sx+(e.x>>3))<<3, 128-cn);
          cy = min((sy+(e.y>>3))<<3, 128-cn);
        },
        onWheel(e) {
          if (e.deltaY <= -1)
            sy = max(sy-1, 0);
          else if (e.deltaY >= 1)
            sy = min(sy+1, 8);
          if (e.deltaX <= -1)
            sx = max(sx-1, 0);
          else if (e.deltaX >= 1)
            sx = min(sx+1, 8);
        },
      },
      {
        name: 'canvas',
        x: 12, y: 16, w: 96, h: 96,
        onDraw() {
          // TODO implement using sprite scaling, clipping, etc.
          sys.rect(this.x-1, this.y-1, this.w+2, this.h+2, null, 0);
          for (let i = 0, y = cy; i < cn; ++i, ++y)
            for (let j = 0, x = cx; j < cn; ++j, ++x)
              sys.rect(this.x+j*cz, this.y+i*cz, cz, cz, sget(x, y));
        },
        onPointerDown(e) {
          const x = cx+floor(e.x/cz), y = cy+floor(e.y/cz);
          if (tool == 'draw')
            draw(x, y, color);
          else if (tool == 'fill')
            fill(x, y, color);
        },
        onPointerMove(e) {
          if ((e.buttons&1) == 0)
            return;
          if (tool == 'draw')
            draw(cx+floor(e.x/cz), cy+floor(e.y/cz), color, true);
        },
        onWheel(e) {
          if (e.deltaY <= -1)
            cy = max(cy-(13-cz), 0);
          else if (e.deltaY >= 1)
            cy = min(cy+(13-cz), 128-cn);
          if (e.deltaX <= -1)
            cx = max(cx-(13-cz), 0);
          else if (e.deltaX >= 1)
            cx = min(cx+(13-cz), 128-cn);
        },
      },
      {
        name: 'menu',
        x: 0, y: 7, w: 64, h: 121,
        visible: false,
        onDraw() {
          sys.rect(this.x, this.y, this.w, this.h, 11, 5);
          for (let i = 1; i < 8; ++i) {
            //sys.rect(this.x, this.y+i*12, this.w, 12, i);
            sys.line(this.x+1, this.y+i*12-1, this.x+this.w-2, this.y+i*12-1, 5)
          }
          sys.rect(this.x, this.y+4*12, this.w, 12, 5);
          sys.text('Alpha 1', 4+this.x, 2+this.y, 5);
          sys.text('Beta 2', 4+this.x, 2+this.y+1*12, 5);
          sys.text('Gamma 3', 4+this.x, 2+this.y+2*12, 5);
          sys.text('Delta 4', 4+this.x, 2+this.y+3*12, 5);
          sys.text('Epsilon 5', 4+this.x, 2+this.y+4*12, 11);
          sys.text('Zeta 6', 4+this.x, 2+this.y+5*12, 5);
          sys.text('Eta 7', 4+this.x, 2+this.y+6*12, 5);
          sys.text('Theta 8', 4+this.x, 2+this.y+7*12, 5);
        },
        onPointerDown() {
        },
      },
    ], this);
  }

  // ---------------------------------------------------------------------------

  onResume() {
    this.sys.memwrite(0x8000, '007c007c007c00000036222222360000001c2a3e3e2a0000003636003636000000080c2c3c3e0000001010101c1c00000000344c1c0000000000586470000000002828106c6c0000003c7c4c4c78000000787c64643c00000000000000000000000000000000000000000000000000000000000000000000000000000000000010387c3e1d090700102040fe7d391100001c1c08087f7f0055004100410055001454547d7f7e3c007f41495d49417f007f41415d41417f007f557f557f557f0000000008000000000000081c0800000000001c1c1c00000000081c3e1c080000001c3e3e3e1c0000081c3e7f3e1c08001c3e7f7f7f3e1c003e7f7f7f7f7f3e00');
  }

  onSuspend() {
    this.sys.save();
  }

};
