// Simple computer
// Marc Lepage Fall 2017

'use strict';

const Buffer = require('./buffer.js');

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
    this.buffer = new Buffer(this.sys._os.filesystem.program); // HACK
    this.scroll = [0, 0]; // scroll position (zero-based index of top left char)
    this.cursor = [0, 0]; // cursor position (zero-based index of cursor)
    this.select = null; // select position (or null)
    this.column = 0; // desired column (for vertical cursor navigation)
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
    const cursorColor = 14;
    const selectColor = 7;
    const textColor = 15;
    const cursorTextColor = 3;
    const selectTextColor = 3;

    const rCursor = this.cursor[0];
    const cCursor = this.cursor[1];
    
    // Menu bar
    this.sys.grect(0, 0, 192, 7, 14);
    this.sys.gtext('{CODE}', 0, 0, 0);
    
    // Status bar
    this.sys.grect(0, 121, 192, 7, 14);
    this.sys.gtext(`LN ${1+rCursor}  COL ${1+cCursor}`, 0, 121, 0);
    
    // Construction stripes
    for (var i = 0; i < 13; ++i) {
      for (var j = 0; j < 7; ++j) {
        this.sys.grect(36+i*12+6-j, j, 6, 1, 0);
      }
    }
    for (var i = 0; i < 10; ++i) {
      for (var j = 0; j < 7; ++j) {
        this.sys.grect(72+i*12+6-j, 121+j, 6, 1, 0);
      }
    }
    
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
        this.sys.grect(0, y, 190, 120-y, emptyColor); // below last line
        break;
      }
      const line = this.buffer.getLine(r);
      const charCount = line.length;
      for (var x = 0, c = this.scroll[1]; x < 190; x+=5, ++c) {
        var ch;
        if (charCount < c) {
          // Right of last character
          this.sys.grect(x, y, 190-x, 7, emptyColor); // right of last character
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
        this.sys.gchar(ch, x, y, fgColor, bgColor); // character
      }
    }
    
    // Extra areas
    this.sys.grect(0, 7, 192, 1, emptyColor);
    this.sys.grect(190, 8, 2, 112, emptyColor);
    this.sys.grect(0, 120, 192, 1, emptyColor);
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
    // HACK
    if (this.sys._os.filesystem.program != this.buffer.getText()) {
      this.main();
    }
  }

  onSuspend() {
    // HACK
    this.sys._os.filesystem.program = this.buffer.getText();
  }

};
