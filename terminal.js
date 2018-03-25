// Phosphor - a browser-based microcomputer
// Copyright (c) 2017-2018 Marc Lepage

'use strict';

const History = require('./history.js');

const max = Math.max, min = Math.min;
const fromCharCode = String.fromCharCode;

function val(val, def) {
  return (val !== undefined) ? val : def;
}

module.exports = class Terminal {

  main() {
    this.isTerminal = true;
    this.w = 38; // width (cols)
    this.h = 18; // height (rows)
    this.reset();
  }

  bell() {
    this.sys.beep();
  }

  clearLine(arg) {
    const l = max(this.L.length-this.h, 0) + this.r;
    const line = this.L[l];
    if (arg == 'left') {
      // TODO
    } else if (arg == 'right') {
      this.L[l] = line.slice(0, this.c);
    } else {
      this.L[l] = '';
    }
  }

  cursorDown(n) {
    const rOld = this.r;
    const rNew = min(rOld+val(n, 1), this.h-1);
    if (rOld != rNew || this.c == this.w) {
      this.r = rNew;
      this.c = min(this.c, this.w-1);
    }
  }

  cursorLeft(n) {
    const cOld = this.c;
    const cNew = max(cOld-val(n, 1), 0);
    if (cOld != cNew) {
      this.c = cNew;
    }
  }

  cursorRight(n) {
    const cOld = this.c;
    const cNew = min(cOld+val(n, 1), this.w-1);
    if (cOld != cNew) {
      this.c = cNew;
    }
  }

  cursorUp(n) {
    const rOld = this.r;
    const rNew = max(rOld-val(n, 1), 0);
    if (rOld != rNew || this.c == this.w) {
      this.r = rNew;
      this.c = min(this.c, this.w-1);
    }
  }

  // TODO maybe fmt should be ...args
  async read(handle, fmt) {
    if (!handle.history)
      handle.history = new History();
    return this.promise = new Promise(resolve => {
      this.reading = {
        fmt: fmt,
        handle: handle,
        buffer: '',
        pos: 0,
        resolve: resolve
      };
    });
  }

  reset() {
    this.process = null; // foreground process
    this.buffer = ''; // read buffer
    
    this.L = ['']; // line data (lines without newlines)
    
    this.r = 0; // cursor row (zero-based)
    this.c = 0; // cursor col (zero-based)
    this.s = 0; // scroll position
    
    this.fg = 15; // foreground color
    this.bg = 0; // background color
    this.cur = 11; // cursor color
    
    this.sys._os.onDraw();
  }

  scrollDown(n) {
    const sOld = this.s;
    const sNew = min(sOld+val(n, 1), max(this.L.length-this.h, 0));
    if (sOld != sNew) {
      this.s = sNew;
    }
  }

  scrollUp(n) {
    const sOld = this.s;
    const sNew = max(sOld-val(n, 1), 0);
    if (sOld != sNew) {
      this.s = sNew;
    }
  }

  setProcess(process) {
    this.process = process;
  }

  // TODO maybe should take handle too?
  write(...args) {
    args.forEach(this._write1, this);
    //for (const arg of args) {
    //  this._write1(arg);
    //}
    this.sys._os.onDraw(); // TEMP need to redraw when called from async function
  }

  // ---------------------------------------------------------------------------

  _char(l, c) { // TEMP probably need get-all-data-for-char function
    if (this.L.length <= l) return ' ';
    const line = this.L[l];
    if (line.length <= c) return ' ';
    return line.charAt(c);
  }

  _dataChar(cc, l, c) {
    const ch = fromCharCode(cc);
    var lineCount = this.L.length;
    while (lineCount <= l) {
      this.L[lineCount++] = '';
    }
    const line = this.L[l];
    const charCount = line.length;
    if (c < charCount) {
      this.L[l] = line.slice(0, c) + ch + line.slice(c+1);
    } else if (c > charCount) {
      this.L[l] += ' '.repeat(c-charCount) + ch;
    } else {
      this.L[l] += ch;
    }
  }

  _gfxCursor(show) {
    const l = max(this.L.length-this.h, 0) + this.r;
    const r = l-this.s;
    if (r >= this.h) return;
    const c = min(this.c, this.w-1);
    this.sys.char(this._char(l, c), c*5, 1+r*7, show ? this.bg : this.fg, show ? this.cur : this.bg);
  }

  _write1(str) {
    var l = max(this.L.length-this.h, 0) + this.r;
    var c = this.c;
    for (var i = 0, count = str.length; i < count; ++i) {
      const cc = str.charCodeAt(i);
      if (32 <= cc && cc < 127) {
        if (c == this.w) { // auto right margin (am)
          ++l;
          if (this.r+1 < this.h) ++this.r;
          c = 0;
          this.sys.beep();
        }
        this._dataChar(cc, l, c);
        ++c;
      } else if (cc == 10) {
        ++l;
        if (this.r+1 < this.h) ++this.r;
        while (this.L.length <= l) {
          this.L[this.L.length] = '';
        }
        c = 0;
      } else {
        console.log(`terminal: ignoring ${cc}`);
      }
    }
    this.c = c;
    this.s = max(this.L.length-this.h, 0); // TEMP always scroll to bottom
  }

  // ---------------------------------------------------------------------------

  onDraw() {
    this.sys.rect(0, 0, 192, 1, this.bg);
    this.sys.rect(190, 1, 2, 126, this.bg);
    this.sys.rect(0, 127, 192, 1, this.bg);
    // TODO optimize this like the code-editor
    const lineCount = this.L.length;
    for (var r = 0, l = this.s; r < this.h; ++r, ++l) {
      if (l == lineCount) {
        for (; r < this.h; ++r)
          for (c = 0; c < this.w; ++c)
            this.sys.char(' ', c*5, 1+r*7, this.fg, this.bg); // below last line
        break;
      }
      const line = this.L[l];
      const charCount = line.length;
      for (var c = 0; c < this.w; ++c) {
        if (c == charCount) {
          // Right of last character
          for (; c < this.w; ++c)
            this.sys.char(' ', c*5, 1+r*7, this.fg, this.bg); // right of last character
          break;
        }
        this.sys.char(line.charAt(c), c*5, 1+r*7, this.fg, this.bg); // character
      }
    }
    this._gfxCursor(true);
  }

  onKeyDown(e) {
    if (e.key.length == 1) {
      this._write1(e.key); // local echo
      if (this.reading) {
        const before = this.reading.buffer.slice(0, this.reading.pos);
        const after = this.reading.buffer.slice(this.reading.pos);
        this._write1(after); // local echo
        this.cursorLeft(after.length);
        this.reading.buffer = before + e.key + after;
        ++this.reading.pos;
      }
    } else switch (e.key) {
      case 'ArrowDown':
        if (this.reading) {
          this.reading.handle.history.set(this.reading.buffer);
          if (this.reading.handle.history.next()) {
            this.reading.buffer = this.reading.handle.history.get();
            this.cursorLeft(this.reading.pos);
            this.clearLine('right');
            this._write1(this.reading.buffer); // local echo
            this.reading.pos = this.reading.buffer.length;
          } else {
            this.bell();
          }
        }
        break;
      case 'ArrowLeft':
        if (this.reading) {
          if (this.reading.pos > 0) {
            --this.reading.pos;
            this.cursorLeft();
          } else {
            this.bell();
          }
        }
        break;
      case 'ArrowRight':
        if (this.reading) {
          if (this.reading.pos < this.reading.buffer.length) {
            ++this.reading.pos;
            this.cursorRight();
          } else {
            this.bell();
          }
        }
        break;
      case 'ArrowUp':
        if (this.reading) {
          this.reading.handle.history.set(this.reading.buffer);
          if (this.reading.handle.history.prev()) {
            this.reading.buffer = this.reading.handle.history.get();
            this.cursorLeft(this.reading.pos);
            this.clearLine('right');
            this._write1(this.reading.buffer); // local echo
            this.reading.pos = this.reading.buffer.length;
          } else {
            this.bell();
          }
        }
        break;
      case 'Backspace':
        if (this.reading && this.reading.pos > 0) {
          const before = this.reading.buffer.slice(0, this.reading.pos-1);
          const after = this.reading.buffer.slice(this.reading.pos);
          this.cursorLeft();
          this._write1(after); // local echo
          this.clearLine('right');
          this.cursorLeft(after.length);
          this.reading.buffer = before + after;
          --this.reading.pos;
        } else {
          this.bell();
        }
        break;
      case 'Enter':
        this._write1('\n'); // local echo
        if (this.reading) {
          this.reading.handle.history.set(this.reading.buffer);
          this.reading.handle.history.commit();
          this.reading.handle.history.new();
          if (this.reading.fmt === 'L')
            this.reading.buffer += '\n';
          this.reading.resolve(this.reading.buffer);
          delete this.reading;
        }
        break;
    }
  }

  onMouseWheel(e) {
    if (e.deltaY <= -1)
      this.scrollUp();
    else if (e.deltaY >= 1)
      this.scrollDown();
  }

  onResume() {
    if (this.process && this.process.onResume) this.process.onResume();
  }

  onSuspend() {
    if (this.process && this.process.onSuspend) this.process.onSuspend();
  }

};
