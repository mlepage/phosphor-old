// Simple computer
// Marc Lepage, Fall 2017

'use strict';

const floor = Math.floor;

const VRAM = 0x0000;
const W = 192; // for graphics
const H = 128; // for graphics

// Format is one byte per character, each bit is a pixel.
// LSB is top left, next bit is to right, row major order.
// abcde  first row is always blank (and omitted)
// fABCD  first col is always blank (but present)
// gEFGH  XWVUkTSRQj...HGFEgDCBAf is the order (MSB to LSB)
// hIJKL
// iMNOP
// jQRST
// kUVWX
const crom = []; // character rom

const mrom = {}; // module rom

const systraceEnable = {
  'beep': true,
  'export': true,
  'gchar': false,
  'gclear': false,
  'gpixel': false,
  'grect': false,
  'gtext': false,
  'import': true,
  'input': true,
  'open': true,
  'output': true,
  'print': true,
  'read': true,
  'reboot': true,
  'seek': true,
  'spawn': true,
  'vc': true,
  'write': true,
};

function systrace(name, sys, ...args) {
  if (systraceEnable[name])
    console.log(`syscall ${name}`, sys, args);
}

// File handle looks like: { file:<filename>, dir:<directory>, pos:<int> }
function isFile(handle) {
  return handle && handle.file;
}

// Terminal handle looks like: { terminal:<terminal> }
function isTerminal(handle) {
  return handle && handle.terminal;
}

function fileRead(handle, ...args) {
}

function fileWrite(handle, ...args) {
}

function fread(fd, fmt) {
  if (isatty(fd)) return null;
  var f = fd.dir[fd.name];
  const eof = f.length;
  switch (fmt !== undefined ? fmt : 'l') {
    case 'n':
      // TODO
      break;
    case 'a':
      f = f.slice(fd.pos);
      fd.pos = eof;
      return f;
    case 'l':
      if (fd.pos == eof) return undefined;
      const i = f.indexOf('\n', fd.pos);
      if (i == -1) {
        f = f.slice(fd.pos);
        fd.pos = eof;
      } else {
        f = f.slice(fd.pos, i);
        fd.pos = i+1;
      }
      return f;
    case 'L':
      // TODO
      break;
    default:
      // TODO try number
  }
}

function fwrite(fd, str) {
  if (isatty(fd)) {
    fd.write(str);
  } else {
    // TODO need to check semantics of overwriting, seeking, etc.
    var f = fd.dir[fd.name];
    f = f.slice(0, fd.pos) + str + f.slice(fd.pos + str.length);
    fd.dir[fd.name] = f;
    fd.pos += str.length;
  }
}

module.exports = class Micro {

  constructor(opts) {
    // TODO probably should go into a device profile
    // and be exposed to both bsp and to processes
    this.w = 192; // screen width
    this.h = 128; // screen height
    this.cw = 5; // char width
    this.ch = 7; // char height
    
    this.syscall = {
      _os: this,
      beep: this.syscall_beep,
      export: this.syscall_export,
      gchar: this.syscall_gchar,
      gclear: this.syscall_gclear,
      gpixel: this.syscall_gpixel,
      grect: this.syscall_grect,
      gtext: this.syscall_gtext,
      import: this.syscall_import,
      input: this.syscall_input,
      open: this.syscall_open,
      output: this.syscall_output,
      print: this.syscall_print,
      read: this.syscall_read,
      reboot: this.syscall_reboot,
      seek: this.syscall_seek,
      spawn: this.syscall_spawn,
      vc: this.syscall_vc,
      write: this.syscall_write,
      // graphics
      clear: this.syscall_clear,
      pal: this.syscall_pal,
      pget: this.syscall_pget,
      pset: this.syscall_pset,
      rect: this.syscall_rect,
    };
    
    this.sys = Object.create(this.syscall);
    this.sys._process = this;
  }

  reboot() {
    this.filesystem = {
      program:'',
      a:'hey diddle diddle\nthe cat and the fiddle\nthe cow jumped over the moon\n',
      b:'the little dog laughed\nto see such a sight\nthe dish ran away with the spoon\n',
      c:'peter piper\npicked a peck of pickled peppers\nhow many pickled peppers\ndid peter piper pick\n',
      d:{ e:'every good boy', f:'deserves fudge' },
      n1: '1\n2\n3\n4\n5\n6\n',
      n2: '1.2\n3.4\n5.6\n7.8\n',
      name: 'print "What is your name?"\nname=read()\nprint("Hello,",name)\n',
      luaprint: 'print("hello", "lua")\n',
      luawrite: 'write("hello lua", "\\n")\n',
    };
    //this.filesystem['..'] = this.filesystem;
    //this.filesystem.d['..'] = this.filesystem;
    this.sys._cwd = this.filesystem;
    
    // 0x3000 will store 192x128 graphics buffer (two pixels per byte)
    this.mem = new Uint8Array(0x3000);
    this.gstate = {
      c: 0,
      pal: [ 0x80, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 ],
    }; // graphics state
    
    this.VC = []; // virtual consoles
    this.vc = this.VC; // current virtual console (temporarily not a vc)
    this.editor = 1; // index of most recently used editor
    this.virtualConsole(0);
  }

  virtualConsole(id, process) {
    if (this.interval) {
      clearInterval(this.interval);
      delete this.interval;
    }
    if (this.vc.onSuspend) {
      this.vc.onSuspend();
    }
    if (process) {
      this.VC[id] = process; // TODO reparent process to _os
    }
    this.vc = this.VC[id];
    if (!this.vc) {
      this.vc = this.VC; // temporarily not a vc
      switch (id) {
        case 0:
          this.vc = this.sys.spawn('terminal');
          this.vc.write("console           type 'help' for help\n\n");
          this.vc.setProcess(this.sys.spawn('shell'));
          break;
        case 1: this.vc = this.sys.spawn('code-editor'); break;
        case 2: this.vc = this.sys.spawn('sprite-editor'); break;
        case 3: this.vc = this.sys.spawn('map-editor'); break;
        case 4: this.vc = this.sys.spawn('sound-editor'); break;
        case 5: this.vc = this.sys.spawn('music-editor'); break;
        case 8: this.vc = this.sys.spawn('breakout'); break;
        case 9:
          this.vc = this.sys.spawn('terminal');
          this.vc.write('micro terminal\n\n');
          break;
        case 10:
          this.vc = this.sys.spawn('terminal');
          this.vc.write('micro shell\n\n');
          this.vc.setProcess(this.sys.spawn('shell'));
          break;
      }
      this.VC[id] = this.vc;
    }
    if (1 <= id && id <= 5) {
      this.editor = id;
    }
    if (this.vc.onResume) {
      this.vc.onResume();
    }
    if (this.vc.onUpdate) {
      this.interval = setInterval(() => {
        this.vc.onUpdate();
        this.vc.onDraw();
      }, 1000/30);
    }
    this.onDraw();
  }

  // syscall -------------------------------------------------------------------

  syscall_beep() {
    systrace('beep', this, arguments);
    this.beep = this._os.bspAudioBeep.bind(this._os);
    return this.beep();
  }

  syscall_export() {
    systrace('export', this, arguments);
    //const json = JSON.stringify(this._os.filesystem);
    this._os.bspExport('program.lua', this._os.filesystem.program);
  }

  syscall_gchar(ch, x, y, fg, bg) {
    systrace('gchar', this, arguments);
    // TODO switch to this eventually
    //this.gclear = this._os.bspScreenClear.bind(this._os);
    //return this.gclear(c);
    
    // TODO this could use speeding up
    const micro = this._os;
    var bmp = crom[ch.charCodeAt()-32];
    const x0 = x, xw = x+micro.cw, yh = y+micro.ch;
    if (bg !== undefined)
      for (x = x0; x < xw; ++x)
        micro.bspScreenPixel(x, y, bg);
    for (++y; y < yh; ++y)
      for (x = x0; x < xw; ++x, bmp >>>= 1)
        if (((bmp&1) === 1) && fg !== undefined) micro.bspScreenPixel(x, y, fg);
        else if (((bmp&1) === 0) && bg !== undefined) micro.bspScreenPixel(x, y, bg);
  }

  syscall_gclear(c) {
    systrace('gclear', this, arguments);
    this.gclear = this._os.bspScreenClear.bind(this._os);
    return this.gclear(c);
  }

  syscall_gpixel(x, y, c) {
    systrace('gpixel', this, arguments);
    this.gpixel = this._os.bspScreenPixel.bind(this._os);
    return this.gpixel(x, y, c);
  }

  syscall_grect(x, y, w, h, c) {
    systrace('grect', this, arguments);
    this.grect = this._os.bspScreenRect.bind(this._os);
    return this.grect(x, y, w, h, c);
  }

  syscall_gtext(str, x, y, fg, bg) {
    systrace('gtext', this, arguments);
    for (var i = 0, count = str.length; i < count; ++i, x+=5) {
      this.gchar(str.charAt(i), x, y, fg, bg);
    }
  }

  syscall_import() {
    systrace('import', this, arguments);
    this._os.bspImport();
  }

  syscall_input(file) {
    systrace('input', this, arguments);
  }

  syscall_open(filename, mode) {
    systrace('open', this, arguments);
    // Assume bare file name, open in current working dir
    return { dir:this._cwd, name:filename, pos:0 };
  }

  syscall_output(file) {
    systrace('output', this, arguments);
  }

  syscall_print(...args) {
    systrace('print', this, arguments);
    this.write(args.join(' ') + '\n');
  }

  // read ([handle,] fmt)
  async syscall_read(...args) {
    systrace('read', this, arguments);
    var handle;
    if (isTerminal(args[0]) || isFile(args[0])) {
      handle = args.shift();
    } else {
      handle = this._input;
    }
    if (handle.terminal) {
      return handle.terminal.read(handle, ...args);
    } else {
      return fileRead(handle, ...args);
    }
  }

  syscall_reboot() {
    systrace('reboot', this, arguments);
    this._os.reboot();
  }

  syscall_seek(fd, offset, whence) {
    systrace('seek', this, arguments);
    // TODO seek, but not for terminals
  }

  syscall_spawn(...args) {
    systrace('spawn', this, arguments);
    const name = args.shift();
    var M = mrom[name];
    if (!M) M = mrom[name] = require(`./${name}.js`);
    const process = new M();
    process.sys = Object.create(this._os.syscall);
    process.sys._name = name;
    process.sys._process = process;
    process.sys._parent = this._process;
    process.sys._terminal = { terminal:this._os.vc }; // TODO get from parent
    process.sys._input = process.sys._terminal; // TODO get from parent
    process.sys._output = process.sys._terminal; // TODO get from parent
    // currently, wait for child like this:
    // const exitStatus = this.sys.spawn('prog', ...args).sys._main
    process.sys._main = new Promise((resolve, reject) => {
      resolve(process.main ? process.main(...args) : 0);
    });
    return process;
  }

  // Equivalent of linux openvt/chvt (TODO improve API)
  syscall_vc(id, process) {
    systrace('vc', this, arguments);
    this._os.virtualConsole(id, process);
  }

  // write ([fd,] ...)
  // Writes the value of each of its arguments to fd. The arguments must be strings or numbers.
  syscall_write(...args) {
    systrace('write', this, arguments);
    var handle;
    if (isTerminal(args[0]) || isFile(args[0])) {
      handle = args.shift();
    } else {
      handle = this._output;
    }
    if (handle.terminal) {
      return handle.terminal.write(...args);
    } else {
      return fileWrite(handle, ...args);
    }
  }

  // graphics ------------------------------------------------------------------

  syscall_clear(c) {
    const os = this._os;
    if (c === undefined) c = os.gstate.c; // default color
    os.bspScreenClear(c);
    //c |= c<<4; // two pixels per byte
    //this._os.memset(VRAM, c, W*H/2);
  }

  syscall_circle(x, y, r, c, fill) {
  }

  syscall_line(x1, y1, x2, y2, c) {
  }

  // pal c1 c2 [trans]
  syscall_pal(c1, c2, trans) {
    this._os.gstate.pal[c1] = c2 | (trans?0x80:0x00);
  }

  // pget x y
  syscall_pget(x, y) {
    const addr = VRAM + floor((y*W + x)/2); // 2px per byte ordered 1100 3322 5544 ...
    const byte = this._os.mem[addr];
    return (byte >>> (4*(x%2))) & 0xf;
  }

  // pset x y [c]
  syscall_pset(x, y, c) {
    const os = this._os;
    if (c === undefined) c = os.gstate.c; // default color
    c = os.gstate.pal[c]; // palette mapping
    if (c&0x80) return; // transparent
    os.bspScreenPixel(x, y, c);
    //const addr = VRAM + floor((y*W + x)/2); // 2px per byte ordered 1100 3322 5544 ...
    //var byte = os.mem[addr];
    //byte &= 0xf0 >>> (4*(x%2));
    //byte |= c << (4*(x%2));
    //os.mem[addr] = byte;
  }

  syscall_rect(x, y, w, h, c, fill) {
    const os = this._os;
    if (c === undefined) c = os.gstate.c; // default color
    c = os.gstate.pal[c]; // palette mapping
    if (c&0x80) return; // transparent
    os.bspScreenRect(x, y, w, h, c);
    // TODO set vram
  }

  syscall_text() {
  }

  // memory --------------------------------------------------------------------

  memcpy(dest_addr, source_addr, len) {
    if (dest_addr < source_addr) {
      while (len--) this.mem[dest_addr++] = this.mem[source_addr++];
    } else if (source_addr < dest_addr) {
      dest_addr += len;
      source_addr += len;
      while (len--) this.mem[--dest_addr] = this.mem[--source_addr];
    }
  }

  memset(dest_addr, val, len) {
    while (len--) this.mem[dest_addr++] = val;
  }

  peek(addr) {
    //if (addr < 0 || 0x7fff < addr) throw 'SIGSEGV';
    return this.mem[addr];
  }

  poke(addr, val) {
    //if (addr < 0 || 0x7fff < addr) throw 'SIGSEGV';
    this.mem[addr] = val;
  }

  // ---------------------------------------------------------------------------

  onDraw() {
    if (this.vc.onDraw) this.vc.onDraw();
  }

  onFileImport(name, contents) {
    // HACK
    this.filesystem.program = contents;
  }

  onKeyDown(e) {
    if (e.ctrlKey) {
      if (!e.altKey && !e.metaKey && !e.shiftKey) {
        if (e.code == 'Backquote') {
          this.virtualConsole(0); e.preventDefault(); return;
        } else if (e.code == 'Digit1') {
          this.virtualConsole(1); e.preventDefault(); return;
        } else if (e.code == 'Digit2') {
          this.virtualConsole(2); e.preventDefault(); return;
        } else if (e.code == 'Digit3') {
          this.virtualConsole(3); e.preventDefault(); return;
        } else if (e.code == 'Digit4') {
          this.virtualConsole(4); e.preventDefault(); return;
        } else if (e.code == 'Digit5') {
          this.virtualConsole(5); e.preventDefault(); return;
        } else if (e.code == 'Digit7') {
          this.virtualConsole(7); e.preventDefault(); return;
        } else if (e.code == 'Digit8') {
          this.virtualConsole(8); e.preventDefault(); return;
        } else if (e.code == 'Digit9') {
          this.virtualConsole(9); e.preventDefault(); return;
        } else if (e.code == 'Digit0') {
          this.virtualConsole(10); e.preventDefault(); return;
        }
      }
      this.onDraw();
      return;
    }
    if (e.key == 'Escape') {
      this.virtualConsole(this.vc == this.VC[0] ? this.editor : 0);
      e.preventDefault();
      this.onDraw();
      return;
    }
    if (this.vc.onKeyDown) this.vc.onKeyDown(e);
    e.preventDefault();
    this.onDraw();
  }

  onMouseClick(e) {
    if (this.vc.onMouseClick) this.vc.onMouseClick(e);
    e.preventDefault();
    this.onDraw();
  }

  onMouseWheel(e) {
    if (this.vc.onMouseWheel) this.vc.onMouseWheel(e);
    e.preventDefault();
    this.onDraw();
  }

  // bsp -----------------------------------------------------------------------

  // NOTE currently using bsp_blah for bsp-private storage

  bspAudioBeep() {console.log('bspAudioBeep')}

  bspExport(name, contents) {console.log('bspExport')}

  bspImport() {console.log('bspImport')}

  bspScreenChar(ch, x, y, fg, bg) {console.log('bspScreenChar')}

  bspScreenClear(c) {console.log('bspScreenClear')}

  bspScreenPixel(x, y, c) {console.log('bspScreenPixel')}

  bspScreenRect(x, y, w, h, c) {console.log('bspScreenRect')}

  // TODO deal with character rom, palette rom, size, scale, etc.
  ctlCharacterRom(rom) {
    for (var i = 0; i < 96; ++i) crom[i] = rom[i];
  }

};
