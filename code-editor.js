// Phosphor - a browser-based microcomputer
// Copyright (c) 2017-2018 Marc Lepage

'use strict';

const Action = require('./action.js');
const Buffer = require('./buffer.js');
const Ui = require('./ui.js');

const floor = Math.floor;
const max = Math.max, min = Math.min;

function clamp(val, min, max) {
  return val < min ? min : max < val ? max : val;
}

function countLastLineChars(str) {
  return str.length - str.lastIndexOf('\n') - 1;
}

function countNewLines(str) {
  // TODO maybe loop using indexOf
  var n = 0;
  for (var i = str.length-1; i >= 0; --i)
    if (str[i] == '\n')
      ++n;
  return n;
}

module.exports = class CodeEditor {

  main() {
    const sys = this.sys;
    
    const buffer = new Buffer(window.program_code);
    var scrollL = 0, scrollC = 0; // scroll position
    var cursorL = 0, cursorC = 0; // cursor position
    var selectL = 0, selectC = 0; // selection position (if active)
    var select = false; // whether selection is active
    var targetC = 0; // target column for vertical cursor navigation
    
    this.handle = window.program_handle;
    this.buffer = buffer;
    this.reset = reset;
    
    // -------------------------------------------------------------------------
    
    const am = new Action(redo, undo, merge, discard);
    const pool = [];
    
    function action(t, l0, c0, l1, c1, t2) {
      if (l1 < l0 || l1 == l0 && c1 < c0) {
        l0 = l1 + (l1 = l0, 0);
        c0 = c1 + (c1 = c0, 0);
      }
      const a = pool.pop() || {};
      a.t = t, a.l0 = l0, a.c0 = c0, a.l1 = l1, a.c1 = c1, a.t2 = t2;
      return a;
    }
    
    function discard(a) {
      a.l2 = null;
      pool.push(a);
    }
    
    function merge(a0, a1) {
      if (a0.t == a1.t) {
        if (a0.t == 'i' && a1.t2[0] != '\n' && a0.l2 == a1.l0 && a0.c2 == a1.c0) {
          a0.l2 = a1.l2, a0.c2 = a1.c2;
          a0.t2 += a1.t2;
          return true;
        } else if (a0.t == 'b' && a1.t1[0] != '\n' && a0.l2 == a1.l1 && a0.c2 == a1.c1) {
          a0.l0 = a1.l0, a0.c0 = a1.c0;
          a0.l2 = a1.l2, a0.c2 = a1.c2;
          a0.t1 = a1.t1 + a0.t1;
          return true;
        }
      }
      return false;
    }
    
    function redo(a) {
      a.t1 = buffer.setText(a.l0, a.c0, a.l1, a.c1, a.t2);
      if (a.l2 == null) {
        const n = countNewLines(a.t2);
        a.l2 = a.l0 + n;
        a.c2 = (n > 0) ? countLastLineChars(a.t2) : a.c0+a.t2.length;
      }
      cursorL = a.l2, cursorC = targetC = a.c2;
      select = false;
      scrollToCursor();
    }
    
    function undo(a) {
      buffer.setText(a.l0, a.c0, a.l2, a.c2, a.t1);
      cursorL = a.l1, cursorC = targetC = a.c1;
      select = false;
      scrollToCursor();
    }
    
    // -------------------------------------------------------------------------
    
    function arrowDown(shift) {
      if (shift && !select)
        selectL = cursorL, selectC = cursorC;
      select = shift;
      const maxL = buffer.getLineCount()-1;
      if (cursorL < maxL)
        ++cursorL, cursorC = min(targetC, buffer.getLine(cursorL).length);
      else if (cursorC < buffer.getLine(maxL).length)
        cursorC = buffer.getLine(maxL).length;
      else {
        sys.beep();
        return;
      }
      scrollToCursor();
    }
    
    function arrowLeft(shift) {
      if (shift && !select)
        selectL = cursorL, selectC = cursorC;
      select = shift;
      if (0 < cursorC)
        --cursorC;
      else if (0 < cursorL)
        --cursorL, cursorC = buffer.getLine(cursorL).length;
      else {
        sys.beep();
        return;
      }
      targetC = cursorC;
      scrollToCursor();
    }
    
    function arrowRight(shift) {
      if (shift && !select)
        selectL = cursorL, selectC = cursorC;
      select = shift;
      if (cursorC < buffer.getLine(cursorL).length)
        ++cursorC;
      else if (cursorL < buffer.getLineCount()-1)
        ++cursorL, cursorC = 0;
      else {
        sys.beep();
        return;
      }
      targetC = cursorC;
      scrollToCursor();
    }
    
    function arrowUp(shift) {
      if (shift && !select)
        selectL = cursorL, selectC = cursorC;
      select = shift;
      if (0 < cursorL)
        --cursorL, cursorC = min(targetC, buffer.getLine(cursorL).length);
      else if (0 < cursorC)
        cursorC = 0;
      else {
        sys.beep();
        return;
      }
      scrollToCursor();
    }
    
    function delete_() {
      if (select)
        am.do(action('d', cursorL, cursorC, selectL, selectC, ''));
      else if (0 < cursorC)
        am.do(action('b', cursorL, cursorC, cursorL, cursorC-1, ''));
      else if (0 < cursorL)
        am.do(action('b', cursorL, cursorC, cursorL-1, buffer.getLine(cursorL-1).length, ''));
      else {
        sys.beep();
        scrollToCursor();
      }
    }
    
    function insert(text) {
      if (select)
        am.do(action('r', cursorL, cursorC, selectL, selectC, text));
      else
        am.do(action('i', cursorL, cursorC, cursorL, cursorC, text))
    }
    
    function reset(text) {
      const maxL = buffer.getLineCount()-1;
      buffer.setText(0, 0, maxL, buffer.getLine(maxL).length, text);
      scrollL = scrollC = cursorL = cursorC = selectL = selectC = targetC = 0;
      select = false;
      am.clear();
    }
    
    function scrollToCursor() {
      scrollL = clamp(scrollL, cursorL-15, cursorL);
      scrollC = clamp(scrollC, cursorC-36, max(cursorC-4, 0));
    }
    
    // -------------------------------------------------------------------------
    
    const ui = new Ui([
      { // bg
        x: 0, y: 0, w: 192, h: 128,
        onDraw() {
          sys.clear(3);
          sys.rect(0, 0, 192, 7, 11);
          sys.rect(0, 121, 192, 7, 11);
          sys.text(`${1+cursorL}:${1+cursorC}`, 0, 121, 5);
        },
      },
      { // text
        x: 0, y: 7, w: 192, h: 114, name: 'text',
        onCopy(e) {
          if (!select) {
            e.clipboardData.setData('text/plain', '');
            return;
          }
          var l0, c0, l1, c1;
          if (selectL < cursorL || selectL == cursorL && selectC <= cursorC)
            l0 = selectL, c0 = selectC, l1 = cursorL, c1 = cursorC;
          else
            l0 = cursorL, c0 = cursorC, l1 = selectL, c1 = selectC;
          const text = buffer.getText(l0, c0, l1, c1);
          e.clipboardData.setData('text/plain', text);
        },
        onCut(e) {
          this.onCopy(e);
          if (select)
            delete_();
        },
        onDraw() {
          var l0, c0, l1, c1;
          if (select)
            if (selectL < cursorL || selectL == cursorL && selectC <= cursorC)
              l0 = selectL, c0 = selectC, l1 = cursorL, c1 = cursorC;
            else
              l0 = cursorL, c0 = cursorC, l1 = selectL, c1 = selectC;
          var bg = null;
          const maxL = buffer.getLineCount()-1;
          for (var y = 8, l = scrollL; y < 120 && l <= maxL; y+=7, ++l) {
            const line = buffer.getLine(l);
            const maxC = line.length;
            for (var x = 0, c = scrollC; x < 190 && c <= maxC; x+=5, ++c) {
              if (l == cursorL && c == cursorC)
                bg = 11; // cursor
              else if (select && (l > l0 || l == l0 && c >= c0) && (l < l1 || l == l1 && c < c1))
                bg = 5; // selection
              else
                bg = null; // plain
              sys.char(c == maxC ? ' ' : line.charAt(c), x, y, 15, bg);
            }
          }
        },
        onKey(e) {
          if (e.key.length != 1) {
            switch (e.key) {
              case 'ArrowDown': arrowDown(e.shiftKey); return;
              case 'ArrowLeft': arrowLeft(e.shiftKey); return;
              case 'ArrowRight': arrowRight(e.shiftKey); return;
              case 'ArrowUp': arrowUp(e.shiftKey); return;
              case 'Backspace': delete_(); return;
              case 'Enter': insert('\n'); return;
            }
            return;
          }
          if (e.ctrlKey) {
            if (e.key == 'z') {
              am.undo();
              return;
            } else if (e.key == 'Z') {
              am.redo();
              return;
            }
          }
          insert(e.key);
        },
        onMouseDown(e) {
          select = false; // TODO handle shift selection, drag select, double click, etc.
          const x = floor(e.x/5), y = floor((e.y-1)/7);
          cursorL = min(scrollL+y, buffer.getLineCount()-1);
          cursorC = min(scrollC+x, buffer.getLine(cursorL).length);
        },
        onPaste(e) {
          if (!select)
            selectL = cursorL, selectC = cursorC, select = true;
          insert(e.clipboardData.getData('text/plain'));
        },
        onWheel(e) {
          if (e.deltaY <= -1) {
            scrollL = max(scrollL-1, 0);
          } else if (e.deltaY >= 1) {
            scrollL = min(scrollL+1, buffer.getLineCount()-1);
          }
          if (e.deltaX <= -1) {
            scrollC = max(scrollC-1, 0);
          } else if (e.deltaX >= 1) {
            scrollC = min(scrollC+1, 100); // TODO proper limit
          }
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
          am.undo();
        },
      },
      { // menu button (redo)
        x: 24, y: 0, w: 8, h: 9,
        onDraw() {
          sys.char(8, this.x, this.y, 5);
        },
        onMouseDown() {
          am.redo();
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
          sys.char(1, this.x, this.y, 15);
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
          sys.char(5, this.x, this.y, 5);
        },
        onMouseDown() {
          sys.vc(5);
        },
      },
    ], this);
    this.ui = ui;
    ui._focus = ui.text;
  }

  // ---------------------------------------------------------------------------

  onResume() {
    this.sys.memwrite(0x8000, '00221408142200000036222222360000001c2a3e3e2a0000003636003636000000080c2c3c3e0000001010101c1c0000007c007c007c00000010087c081000000010207c20100000002828106c6c0000003c7c4c4c78000000787c64643c0000000000000000000000000000000000000000000000000000000000000000000010387c3e1d090700102040fe7d391100000000000000000055004100410055001454547d7f7e3c007f41415d41417f007f41495d49417f007f557f557f557f00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040604000000000404040400000000040c0400');
    if (this.handle !== window.program_handle)
      this.reset(window.program_code);
  }

  onSuspend() {
    window.program_code = this.buffer.getText();
    this.sys.save();
  }

};
