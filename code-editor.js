// Simple computer
// Marc Lepage Fall 2017

'use strict';

const Buffer = require('./buffer.js');
const Ui = require('./ui.js');

const max = Math.max, min = Math.min;

// Does a range contain a position?
function contains(start, end, pos) {
  return (start[0] < pos[0] || start[0] == pos[0] && start[1] <= pos[1])
      && (pos[0] < end[0] || pos[0] == end[0] && pos[1] < end[1]);
}

function containsrc(start, end, r, c) {
  return (start[0] < r || start[0] == r && start[1] <= c)
      && (r < end[0] || r == end[0] && c < end[1]);
}

function order(a, b) {
  if (poscmp(a, b) > 0) swap(a, b);
}

// Compare two positions
function poscmp(a, b) {
  return a[0] == b[0] ? a[1] - b[1] : a[0] - b[0];
}

function swap(a, b) {
  var tmp = a[0]; a[0] = b[0]; b[0] = tmp;
  tmp = a[1]; a[1] = b[1]; b[1] = tmp;
}

// Value or default (if undefined)
function val(val, def) {
  return (val !== undefined) ? val : def;
}

module.exports = class CodeEditor {

  main() {
    const sys = this.sys;
    
    this.handle = window.program_handle;
    this.buffer = new Buffer(window.program_code);
    this.scroll = [0, 0]; // scroll position (zero-based index of top left char)
    this.cursor = [0, 0]; // cursor position (zero-based index of cursor)
    this.select = null; // select position (or null)
    this.column = 0; // desired column (for vertical cursor navigation)
    
    const ui = new Ui([
      { // bg
        x: 0, y: 0, w: 192, h: 128,
        onDraw() {
          //sys.clear(3);
          sys.rect(0, 0, 192, 7, 11);
          sys.rect(0, 121, 192, 7, 11);
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
    ]);
    this.ui = ui;
  }

  backspace() {
    // TODO needs much fixing, this.column is off, use cursorLeft etc.
    if (this.select) {
      order(this.cursor, this.select);
    } else if (poscmp([0, 0], this.cursor) < 0) {
      this.select = [this.cursor[0], this.cursor[1]];
      if (--this.cursor[1] < 0) {
        if (--this.cursor[0] < 0) return;
        this.cursor[1] = this.buffer.getLine(this.cursor[0]).length;
      }
    }
    if (this.select) {
      this.buffer.setText([this.cursor, this.select], '');
      this.select = null;
    }
  }

  character(ch) {
    // TODO typing must affect selection
    this.buffer.insert(this.cursor, ch);
    this.cursorRight(false);
  }

  cursorDown(select) {
    // if at EOF, do nothing (and still blink)
    // if at last line, go to EOF
    // if selection but not selecting
    //   at top of selection --> go to bottom of selection
    //   at bottom of selection --> go down one row
    //   clear selection and target col in both cases
    // if no selection and not selecting, target col
    // if no selection and selecting, start selecting
    // if selection and selecting, just keep moving
    this.preSelect(select);
    if (this.buffer.posDown(this.cursor, this.column)) {
      this.postSelect();
      this.scrollToCursor();
    }
  }

  cursorLeft(select) {
    // if there's a selection at all, go to its beginning and clear it
    // clear the target column
    // handle line wrapping
    // don't do anything if at beginning
    this.preSelect(select);
    if (this.buffer.posLeft(this.cursor)) {
      this.postSelect();
      this.column = this.cursor[1];
      this.scrollToCursor();
    }
  }

  cursorRight(select) {
    this.preSelect(select);
    if (this.buffer.posRight(this.cursor)) {
      this.postSelect();
      this.column = this.cursor[1];
      this.scrollToCursor();
    }
  }

  cursorUp(select) {
    this.preSelect(select);
    if (this.buffer.posUp(this.cursor, this.column)) {
      this.postSelect();
      this.scrollToCursor();
    }
  }

  enter() {
    // TODO enter must affect selection
    this.buffer.insert(this.cursor, '\n');
    this.cursorRight(false);
  }

  preSelect(select) {
    if (select && !this.select)
      this.select = [this.cursor[0], this.cursor[1]];
    else if (!select && this.select)
      this.select = null;
  }

  postSelect() {
    if (this.select && poscmp(this.select, this.cursor) === 0)
      this.select = null;
  }

  scrollDown(n) {
    const rOld = this.scroll[0];
    const rNew = min(rOld+val(n, 1), this.buffer.getLineCount()-1);
    if (rOld !== rNew) {
      this.scroll[0] = rNew;
    }
  }

  scrollLeft(n) {
    const cOld = this.scroll[1];
    const cNew = max(cOld-val(n, 1), 0);
    if (cOld !== cNew) {
      this.scroll[1] = cNew;
    }
  }

  scrollRight(n) {
    const cOld = this.scroll[1];
    const cNew = min(cOld+val(n, 1), 38); // TODO max line length
    if (cOld !== cNew) {
      this.scroll[1] = cNew;
    }
  }

  scrollToCursor() {
    if (this.scroll[0] < this.cursor[0]-15) {
      this.scroll[0] = this.cursor[0]-15;
    } else if (this.scroll[0] > this.cursor[0]) {
      this.scroll[0] = this.cursor[0];
    }
    if (this.scroll[1] < this.cursor[1]-36) {
      this.scroll[1] = this.cursor[1]-36;
    } else if (this.scroll[1] > this.cursor[1]-4) {
      this.scroll[1] = max(this.cursor[1]-4, 0);
    }
    if (this.scroll[0] < 0 || this.scroll[1] < 0) {
      console.log('ERROR ERROR ERROR', this.scroll, this.cursor);
    }
  }

  scrollUp(n) {
    const rOld = this.scroll[0];
    const rNew = max(rOld-val(n, 1), 0);
    if (rOld !== rNew) {
      this.scroll[0] = rNew;
    }
  }

  // ---------------------------------------------------------------------------

  onDraw() {
    const emptyColor = 3;
    const cursorColor = 11;
    const selectColor = 5;
    const textColor = 15;
    const cursorTextColor = 3;
    const selectTextColor = 3;
    
    const rCursor = this.cursor[0];
    const cCursor = this.cursor[1];
    
    this.ui.onDraw();
    
    // Status bar
    this.sys.text(`LN ${1+rCursor}  COL ${1+cCursor}`, 0, 121, 5);
    
    // Text area
    const sel = this.select;
    var selStart, selEnd;
    if (sel) {
      if (poscmp(this.cursor, sel) < 0) {
        selStart = this.cursor;
        selEnd = sel;
      } else {
        selStart = sel;
        selEnd = this.cursor;
      }
    }
    const lineCount = this.buffer.getLineCount();
    for (var y = 8, r = this.scroll[0]; y < 120; y+=7, ++r) {
      if (r == lineCount) {
        this.sys.rect(0, y, 190, 120-y, emptyColor); // below last line
        break;
      }
      const line = this.buffer.getLine(r);
      const charCount = line.length;
      for (var x = 0, c = this.scroll[1]; x < 190; x+=5, ++c) {
        var ch;
        if (charCount < c) {
          // Right of last character
          this.sys.rect(x, y, 190-x, 7, emptyColor); // right of last character
          break;
        } else if (c == charCount) {
          ch = ' ';
        } else {
          ch = line.charAt(c);
        }
        var bgColor, fgColor;
        if (r == rCursor && c == cCursor) {
          bgColor = cursorColor;
          fgColor = cursorTextColor;
        } else if (sel && containsrc(selStart, selEnd, r, c)) {
          bgColor = selectColor;
          fgColor = selectTextColor;
        } else {
          bgColor = emptyColor;
          fgColor = textColor;
        }
        this.sys.char(ch, x, y, fgColor, bgColor); // character
      }
    }
    
    // Extra areas
    this.sys.rect(0, 7, 192, 1, emptyColor);
    this.sys.rect(190, 8, 2, 112, emptyColor);
    this.sys.rect(0, 120, 192, 1, emptyColor);
  }

  onKeyDown(e) {
    if (e.key.length == 1) {
      const cc = e.key.charCodeAt();
      if (32 <= cc && cc < 127)
        this.character(e.key);
      else
        console.log('code-editor.onKeyDown: non-printable', cc);
      return;
    }
    switch (e.key) {
      case 'ArrowDown': this.cursorDown(e.shiftKey); break;
      case 'ArrowLeft': this.cursorLeft(e.shiftKey); break;
      case 'ArrowRight': this.cursorRight(e.shiftKey); break;
      case 'ArrowUp': this.cursorUp(e.shiftKey); break;
      case 'Backspace': this.backspace(); break;
      case 'Enter': this.enter(); break;
    }
  }

  onMouseClick(e) {
  }

  onMouseWheel(e) {
    if (e.deltaY <= -1) this.scrollUp();
    else if (e.deltaY >= 1) this.scrollDown();
    else if (e.deltaX <= -1) this.scrollLeft();
    else if (e.deltaX >= 1) this.scrollRight();
  }

  onResume() {
    this.sys.memwrite(0x8000, '00221408142200000036222222360000001c2a3e3e2a0000003636003636000000080c2c3c3e0000001010101c1c0000007c007c007c00000010087c081000000010207c20100000002828106c6c0000003c7c4c4c78000000787c64643c0000000000000000000000000000000000000000000000000000000000000000000010387c3e1d090700102040fe7d391100000000000000000055004100410055001454547d7f7e3c007f41415d41417f007f41495d49417f007f557f557f557f00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040604000000000404040400000000040c0400');
    if (this.handle !== window.program_handle)
      this.main();
  }

  onSuspend() {
    window.program_code = this.buffer.getText();
    this.sys.save();
  }

};
