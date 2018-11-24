// Phosphor - a browser-based microcomputer
// Copyright (c) 2017-2018 Marc Lepage

'use strict';

const abs = Math.abs, floor = Math.floor;

const phKeyCodes = {
  0:0, 1:1, 2:2, 3:3, 4:4,
  5:5, 6:6, 7:7, 8:8, 9:9,
  '`':10, '-':11, '=':12,
  '[':13, ']':14, '\\':15,
  ';':16, "'":17,
  ',':18, '.':19, '/':20,
  a:21, b:22, c:23, d:24, e:25,
  f:26, g:27, h:28, i:29, j:30,
  k:31, l:32, m:33, n:34, o:35,
  p:36, q:37, r:38, s:39, t:40,
  u:41, v:42, w:43, x:44, y:45, z:46,
  space:47, tab:48, enter:49, backspace:50, capslock:51,
  up:52, down:53, left:54, right:55,
  lctrl:56, lshift:57, lalt:58,
  rctrl:59, rshift:60, ralt:61,
};
const jsKeyCodes = {
  Digit0:0, Digit1:1, Digit2:2, Digit3:3, Digit4:4,
  Digit5:5, Digit6:6, Digit7:7, Digit8:8, Digit9:9,
  Backquote:10, Minus:11, Equal:12,
  BracketLeft:13, BracketRight:14, Backslash:15,
  Semicolon:16, Quote:17,
  Comma:18, Period:19, Slash:20,
  KeyA:21, KeyB:22, KeyC:23, KeyD:24, KeyE:25,
  KeyF:26, KeyG:27, KeyH:28, KeyI:29, KeyJ:30,
  KeyK:31, KeyL:32, KeyM:33, KeyN:34, KeyO:35,
  KeyP:36, KeyQ:37, KeyR:38, KeyS:39, KeyT:40,
  KeyU:41, KeyV:42, KeyW:43, KeyX:44, KeyY:45, KeyZ:46,
  Space:47, Tab:48, Enter:49, Backspace:50, CapsLock:51,
  ArrowUp:52, ArrowDown:53, ArrowLeft:54, ArrowRight:55,
  ControlLeft:56, ShiftLeft:57, AltLeft:58,
  ControlRight:59, ShiftRight:60, AltRight:61,
};

const toHex = [
  '0', '1', '2', '3', '4', '5', '6', '7',
  '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'
];
const fromHex = {
  '0':0x0, '1':0x1, '2':0x2, '3':0x3, '4':0x4,
  '5':0x5, '6':0x6, '7':0x7, '8':0x8, '9':0x9,
  'a':0xa, 'b':0xb, 'c':0xc, 'd':0xd, 'e':0xe, 'f':0xf,
  'A':0xa, 'B':0xb, 'C':0xc, 'D':0xd, 'E':0xe, 'F':0xf
};

// Memory map
const VRAM = 0x0000; // video ram (12K)
const SRAM = 0x3000; // sprite ram (8K)
const MRAM = 0x5000; // map ram (9K)
const CRAM = 0x8000; // character ram (1K)

const W = 192; // for graphics
const H = 128; // for graphics

// Character ROM, 8 bytes per 128 characters
// Each byte is one row, each bit (LSB to MSB) is one col (left to right)
// Last 8 bytes (char 127 DEL) are width/height bytes for 4 banks of 32 chars
const CROM = '00000000000000000004040400040000000a0a0000000000000a0e0a0e0a0000000e060c0e040000000a0804020a000000040a060a16000000040400000000000008040404080000000408080804000000000a040a0000000000040e0400000000000000000402000000000e0000000000000000000400000010180c06020000000c1a16120c000000040604040e0000000e100c021e0000000e100c100e0000000a0a1e08080000001e020e100e0000001c020e120c0000001e100804040000000c120c120c0000000c121c100c000000000004000400000000000400040200000804020408000000000e000e0000000004081008040000000e100c00040000000c121a021c0000000c12121e120000000e120e120e0000000c1202120c0000000e1212120e0000001e020e021e0000001e020e02020000001c021a121c00000012121e12120000000e0404040e0000001c1010120c000000120a060a12000000020202021e0000001e1a12121200000012161a12120000000c1212120c0000000e12120e020000000c1212120c1000000e12120e120000001c020c100e0000001e04040404000000121212120c0000001212120a04000000121212161e00000012120c121200000012121c100c0000001e1008041e0000000c0404040c00000002060c18100000000c0808080c000000040a000000000000000000001e0000000004080000000000001c12121c000000020e12120e000000001c02021c000000101c12121c000000000c1a060c00000018041e0404000000000c121c100c0000020e12121200000008000c081c00000010001810120c000002120e12120000000604040418000000001e1a1212000000000e121212000000000c12120c000000000e12120e020000001c12121c100000001c020202000000001c04080e000000041e040418000000001212120c0000000012120a04000000001212161e00000000120c12120000000012121c100c0000001e08041e0000000c0406040c00000004040404040000000c0818080c00000000140a000000000808050705070507';

const mrom = {}; // module rom

function bitset(mem, base, pos) {
  const addr = base + (pos>>3);
  mem[addr] |= (1<<(pos&7));
}

function bitclear(mem, base, pos) {
  const addr = base + (pos>>3);
  mem[addr] &= ~(1<<(pos&7));
}

function bitflip(mem, base, pos) {
  const addr = base + (pos>>3);
  mem[addr] ^= (1<<(pos&7));
}

function bittest(mem, base, pos) {
  const addr = base + (pos>>3);
  return (mem[addr] & (1<<(pos&7))) ? true : false;
}

const systraceEnable = {
  'beep': true,
  'cd': true,
  'cp': true,
  'export': true,
  'gclear': false,
  'gpixel': false,
  'grect': false,
  'grecto': false,
  'import': true,
  'input': true,
  'key': true,
  'load': true,
  'ls': true,
  'mkdir': true,
  'mv': true,
  'open': true,
  'output': true,
  'print': true,
  'read': true,
  'reboot': true,
  'rm': true,
  'rmdir': true,
  'scale': true,
  'seek': true,
  'spawn': true,
  'vc': true,
  'write': true,
};

function systrace(name, sys, ...args) {
  if (systraceEnable[name])
    console.log(`syscall ${name}`, sys, args);
}

const demoHello = `-- hello (demo)
write('What is your name? ')
name = read()
print('Hello', name)
`;

const demoBounce = `-- bounce (demo)
r,d = 4,8
x,y = 96,64
dx,dy = 2,1

function update()
  x,y = x+dx,y+dy
  if x < d or 192-d < x then dx = -dx end
  if y < d or 128-d < y then dy = -dy end
end

function draw()
  clear(5)
  rect(x-r, y-r, d, d, 11)
end
`;

function localStorageAvailable() {
  try {
    localStorage.setItem('phosphor', 'test');
    const result = localStorage.getItem('phosphor') == 'test';
    localStorage.removeItem('phosphor');
    return result;
  } catch(e) {
    return false;
  }
}

// Returns filesystem key, assuming absolute name
function fskey(name) {
  return `phosphor:${name}`;
}

const filesystem = localStorageAvailable() ? localStorage : {};
filesystem[fskey('/')] = true;
filesystem[fskey('/hello')] = demoHello;
filesystem[fskey('/bounce')] = demoBounce;

// File handle looks like: { file:'/full/path/name', key:'phosphor:/full/path/name', mode:'r+', pos:123 }
function isFile(handle) {
  return handle && handle.file;
}

// Terminal handle looks like: { terminal:<terminal> }
function isTerminal(handle) {
  return handle && handle.terminal;
}

// Return canonical resolved name, or undefined
// http://man7.org/linux/man-pages/man7/path_resolution.7.html
function resolve(cwd, name) {
  // Eliminate multiple slashes
  name = name.replace(/[\/]+/g, '/');
  // Ensure name is absolute
  if (name.charAt() !== '/')
    name = cwd + name;
  // Resolve directories
  var resolved = '';
  name.replace(/[^\/]*\//g, (match) => {
    if (match === '../')
      resolved = resolved.replace(/[^\/]+\/$/, '');
    else
      resolved += match;
  });
  // Resolve file
  if (name.charAt(name.length-1) !== '/') {
    name = name.match(/([^\/]+)$/)[1];
    if (name === '..')
      resolved = resolved.replace(/[^\/]+\/$/, '');
    else
      resolved += name;
  }
  return resolved;
}

const fileModes = { 'r':true, 'w':true, 'a':true, 'r+':true, 'w+':true, 'a+':true };

function fileOpen(filename, mode) {
  if (typeof filename !== 'string')
    return undefined;
  if (mode === undefined)
    mode = 'r';
  else if (!fileModes[mode])
    return undefined;
  // TODO relative paths './foo' '../foo' '..//../././//foo' etc. using cwd
  // TODO absolute paths (already have '/' root)
  const key = `phosphor:/${filename}`;
  var pos = 0;
  switch (mode) {
    case 'r':
    case 'r+':
      if (filesystem[key] === undefined)
        return undefined;
      break;
    case 'w':
    case 'w+':
      filesystem[key] = '';
      break;
    case 'a':
      if (filesystem[key] !== undefined)
        pos = filesystem[key].length;
        // fall through
    case 'a+':
      if (filesystem[key] === undefined)
        filesystem[key] = '';
      break;
  }
  return { file:`/${filename}`, key:key, mode:mode, pos:pos };
}

// TODO need file error states (e.g. eof)

function fileRead(handle, ...args) {
  console.log('fileRead', handle, ...args);
  if (handle.mode === 'w' || handle.mode === 'a')
    return undefined;
  var file = filesystem[handle.key];
  var pos = handle.pos;
  var arg = args.shift();
  if (arg === undefined)
    arg = 'l';
  if (arg === 'l' || arg === 'L') {
    if (pos === file.length)
      return undefined; // eof
    const idx = file.indexOf('\n', pos);
    if (idx === -1) {
      handle.pos = file.length;
      return file.slice(pos);
    } else {
      handle.pos = idx+1;
      return file.slice(pos, idx + (arg === 'L' ? 1 : 0));
    }
  } else if (arg === 'a') {
    handle.pos = file.length;
    return file.slice(pos); // eof --> empty string
  }
}

function fileSeek(handle, ...args) {
  console.log('fileSeek', handle, ...args);
}

function fileWrite(handle, ...args) {
  console.log('fileWrite', handle, ...args);
  if (handle.mode === 'r')
    return -1;
  var file = filesystem[handle.key];
  var pos = (handle.mode.charAt() === 'a') ? file.length : handle.pos;
  var written = 0;
  while (true) {
    var arg = args.shift();
    if (typeof arg === 'number')
      arg = String(arg);
    else if (typeof arg !== 'string')
      break;
    file = file.slice(0, pos) + arg + file.slice(pos + arg.length);
    pos += arg.length;
    written += arg.length;
  }
  filesystem[handle.key] = file;
  handle.pos = pos;
  return written;
}

// global
window.loadedFile = undefined;

function pget(vram, x, y) {
  // 2px per byte ordered 1100 3322 5544 ...
  const a = (y*96)+(x>>1), s = (x&1)<<2;
  const b = vram[a];
  return (b>>s)&0xf;
}

function pset(vram, x, y, c) {
  // 2px per byte ordered 1100 3322 5544 ...
  const a = (y*96)+(x>>1), s = (x&1)<<2;
  var b = vram[a];
  vram[a] = (b&(0xf0>>s)) | (c<<s);
}

function plotLineLow(mem, x0, y0, x1, y1, c) {
  var dx = x1 - x0;
  var dy = y1 - y0;
  var yi = 1;
  if (dy < 0) {
    yi = -1;
    dy = -dy;
  }
  var D = 2*dy - dx;
  var y = y0;

  for (var x = x0; x <= x1; ++x) {
    pset(mem, x, y, c);
    if (D > 0) {
       y = y + yi;
       D = D - 2*dx;
    }
    D = D + 2*dy;
  }
}

function plotLineHigh(mem, x0, y0, x1, y1, c) {
  var dx = x1 - x0;
  var dy = y1 - y0;
  var xi = 1;
  if (dx < 0) {
    xi = -1;
    dx = -dx;
  }
  var D = 2*dx - dy;
  var x = x0;

  for (var y = y0; y <= y1; ++y) {
    pset(mem, x, y, c);
    if (D > 0) {
       x = x + xi;
       D = D - 2*dy;
    }
    D = D + 2*dx;
  }
}

module.exports = class Phosphor {

  constructor() {
    // TODO probably should go into a device profile
    // and be exposed to both bsp and to processes
    this.w = 192; // screen width
    this.h = 128; // screen height
    
    this.mem = new Uint8Array(0x8400); // 32 KiB RAM + 1 KiB ROM
    
    this.iomem = new Uint8Array(32); // TEMP io memory map

    this.filesystem = filesystem; // HACK
    
    // TODO syscall object could probably be global (reuse per computer)
    this.syscall = { _os:this };
    // https://stackoverflow.com/questions/37771418/iterate-through-methods-and-properties-of-an-es6-class
    const names = Object.getOwnPropertyNames(Phosphor.prototype);
    for (let name of names)
      if (/^syscall_/.test(name))
        this.syscall[name.slice(8)] = this[name];
    
    this.sys = Object.create(this.syscall);
    this.sys._process = this;
  }

  reboot() {
    this.sys.reboot();
  }

  // syscall -------------------------------------------------------------------

  syscall_beep() {
    systrace('beep', this, arguments);
    this.beep = this._os.bspAudioBeep.bind(this._os);
    return this.beep();
  }

  // Return current directory if no arg
  // Return (absolute) new current directory if exists
  // Return undefined if no such directory
  syscall_cd(name) {
    systrace('cd', this, arguments);
    if (name === undefined)
      return this._cwd;
    name = resolve(this._cwd, name);
    if (name.charAt(name.length-1) !== '/')
      name += '/';
    if (!filesystem[fskey(name)])
      return;
    this._cwd = name;
    return name;
  }

  syscall_char(ch, x, y, c1, c2) {
    x = floor(x), y = floor(y);
    const os = this._os, mem = os.mem, pal = os.pal;
    if (c1 != undefined || c2 != undefined) {
      os.c1 = c1;
      os.c2 = c2;
    } else {
      c1 = os.c1;
      c2 = os.c2;
    }
    if (c1 != undefined)
      c1 = pal[c1];
    if (c2 != undefined)
      c2 = pal[c2];
    if (typeof(ch) == 'string')
      ch = ch.charCodeAt();
    var a = CRAM+0x3f8+((ch&~31)>>4);
    const x_ = x, xw = x+mem[a], yh = y+mem[++a];
    a = CRAM+(ch<<3);
    if (c1 != undefined && c2 != undefined) {
      for (; y < yh; ++y) {
        var b = mem[a++];
        for (x = x_; x < xw; ++x, b>>>=1) {
          pset(mem, x, y, b&1 ? c1 : c2);
        }
      }
    } else if (c1 != undefined) {
      for (; y < yh; ++y) {
        var b = mem[a++];
        for (x = x_; x < xw; ++x, b>>>=1) {
          if ((b&1) === 1)
            pset(mem, x, y, c1);
        }
      }
    } else if (c2 != undefined) {
      for (; y < yh; ++y) {
        var b = mem[a++];
        for (x = x_; x < xw; ++x, b>>>=1) {
          if ((b&1) === 0)
            pset(mem, x, y, c2);
        }
      }
    }
  }

  // TODO rename args
  // https://en.wikipedia.org/wiki/Midpoint_circle_algorithm
  syscall_circle(x0, y0, radius, c1, c2) {
    x0 = floor(x0), y0 = floor(y0), radius = floor(radius);
    const os = this._os, mem = os.mem, pal = os.pal;
    if (c1 != undefined || c2 != undefined) {
      os.c1 = c1;
      os.c2 = c2;
    } else {
      c1 = os.c1;
      c2 = os.c2;
    }
    if (c1 != undefined)
      c1 = pal[c1];
    if (c2 != undefined)
      c2 = pal[c2];
    if (c1 != undefined) {
      var x = radius-1;
      var y = 0;
      var dx = 1;
      var dy = 1;
      var err = dx - (radius << 1);
      while (x >= y) {
        plotLineLow(mem, x0-y, y0-x, x0+y, y0-x, c1);
        plotLineLow(mem, x0-x, y0-y, x0+x, y0-y, c1);
        plotLineLow(mem, x0-x, y0+y, x0+x, y0+y, c1);
        plotLineLow(mem, x0-y, y0+x, x0+y, y0+x, c1);
        if (err <= 0) {
          y++;
          err += dy;
          dy += 2;
        }
        if (err > 0) {
          x--;
          dx += 2;
          err += dx - (radius << 1);
        }
      }
    }
    if (c2 != undefined) {
      var x = radius-1;
      var y = 0;
      var dx = 1;
      var dy = 1;
      var err = dx - (radius << 1);
      while (x >= y) {
        pset(mem, x0-y, y0-x, c2);
        pset(mem, x0+y, y0-x, c2);
        pset(mem, x0-x, y0-y, c2);
        pset(mem, x0+x, y0-y, c2);
        pset(mem, x0-x, y0+y, c2);
        pset(mem, x0+x, y0+y, c2);
        pset(mem, x0-y, y0+x, c2);
        pset(mem, x0+y, y0+x, c2);
        if (err <= 0) {
          y++;
          err += dy;
          dy += 2;
        }
        if (err > 0) {
          x--;
          dx += 2;
          err += dx - (radius << 1);
        }
      }
    }
  }

  syscall_clear(c) {
    this._os.mem.fill((c<<4)|c, 0, 0x3000);
  }

  syscall_export(name) {
    systrace('export', this, arguments);
    name = resolve(this._cwd, name);
    if (name.charAt(name.length-1) === '/')
      return undefined;
    if (filesystem[fskey(name)] === undefined)
      return undefined;
    const contents = filesystem[fskey(name)];
    var basename = name.substr(name.lastIndexOf('/') + 1);
    if (!/\.lua$/.test(basename))
      basename += '.lua';
    this._os.bspExport(basename, contents);
    return name;
  }

  syscall_exportfs() {
    systrace('exportfs', this, arguments);
    const json = JSON.stringify(filesystem);
    this._os.bspExportFs('filesystem.json', json);
  }

  syscall_import() {
    systrace('import', this, arguments);
    this._os.bspImport();
  }

  syscall_importfs() {
    systrace('importfs', this, arguments);
    this._os.bspImportFs();
  }

  syscall_input(file) {
    systrace('input', this, arguments);
  }

  syscall_key(keycode) {
    if (typeof keycode == 'string')
      keycode = phKeyCodes[keycode];
    // TODO check arg in range (string or number)
    return bittest(this._os.iomem, 0, keycode);
  }

  syscall_keyp(keycode, rate, delay) {
    if (typeof keycode == 'string')
      keycode = phKeyCodes[keycode];
    // TODO check arg in range (string or number)
    return bittest(this._os.iomem, 0, keycode) && !bittest(this._os.iomem, 16, keycode);
  }

  syscall_keyr(keycode) {
    if (typeof keycode == 'string')
      keycode = phKeyCodes[keycode];
    // TODO check arg in range (string or number)
    return !bittest(this._os.iomem, 0, keycode) && bittest(this._os.iomem, 16, keycode);
  }

  // TODO change x0 x1 to x1 x2?
  // https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm
  syscall_line(x0, y0, x1, y1, c) {
    x0 = floor(x0), y0 = floor(y0), x1 = floor(x1), y1 = floor(y1);
    const os = this._os, mem = os.mem, pal = os.pal;
    if (c != undefined) {
      os.c1 = c;
    } else {
      c = os.c1;
    }
    if (c != undefined)
      c = pal[c];
    if (c == undefined)
      return;
    if (abs(y1 - y0) < abs(x1 - x0)) {
      if (x0 > x1)
        plotLineLow(mem, x1, y1, x0, y0, c);
      else
        plotLineLow(mem, x0, y0, x1, y1, c);
    } else {
      if (y0 > y1)
        plotLineHigh(mem, x1, y1, x0, y0, c);
      else
        plotLineHigh(mem, x0, y0, x1, y1, c);
    }
  }

  syscall_load(filename) {
    systrace('load', this, arguments);
    const handle = fileOpen(filename, 'r');
    this.memset(0x3000, 0x5000, 0);
    delete window.program_handle;
    delete window.program_code;
    // TODO should return true/false and let shell print feedback
    if (handle) {
      var contents = this._os.filesystem[handle.key];
      contents = contents.replace(/--\[\[phosphor@[0-9A-Fa-f]{4}=[0-9A-Fa-f]+\]\]\n?/g, (match) => {
        const addr = (fromHex[match[13]]<<12)|(fromHex[match[14]]<<8)|(fromHex[match[15]]<<4)|fromHex[match[16]]
        const str = match.substring(18, match.length - (match[match.length-1] == '\n' ? 3 : 2));
        this.memwrite(addr, str);
        return '';
      });
      window.program_handle = handle;
      window.program_code = contents;
      this.print('ok');
    } else {
      this.print('load error');
    }
  }

  // Return list of files/directories (could be empty)
  // Return undefined if no such directory
  syscall_ls(name) {
    systrace('ls', this, arguments);
    if (name === undefined)
      name = this._cwd;
    name = resolve(this._cwd, name);
    if (name.charAt(name.length-1) !== '/')
      name += '/';
    if (!filesystem[fskey(name)])
      return undefined;
    const list = [];
    const len = 9 + name.length;
    const re = new RegExp(`^phosphor:${name}[^/]+/?$`);
    for (var key in filesystem)
      if (filesystem.hasOwnProperty(key) && re.test(key))
        list.push(key.slice(len));
    return list;
  }

  syscall_map(sx, sy, x, y, w, h) {
    sx = floor(sx), sy = floor(sy), x = floor(x), y = floor(y), w = floor(w), h = floor(h);
    const x_ = x, y_ = y;
    for (y = 0; y < h; ++y)
      for (x = 0; x < w; ++x)
        this.sprite(this.mget(x_+x, y_+y), sx+(x<<3), sy+(y<<3));
  }

  syscall_memcopy(addr, len, addr_from) {
    this._os.mem.copyWithin(addr, addr_from, addr_from+len);
  }

  syscall_memread(addr, len) {
    const mem = this._os.mem;
    var str = '';
    for (; 0 < len; --len) {
      var b = mem[addr++];
      str += toHex[b>>4] + toHex[b&0xf];
    }
    return str;
  }

  syscall_memset(addr, len, val) {
    this._os.mem.fill(val, addr, addr+len);
  }

  syscall_memwrite(addr, str) {
    const mem = this._os.mem;
    for (var i = 0, len = str.length&~1; i < len; i+=2) {
      mem[addr++] = (fromHex[str.charAt(i)]<<4) | fromHex[str.charAt(i|1)];
    }
  }

  syscall_mget(x, y) {
    x = floor(x), y = floor(y);
    return this._os.mem[MRAM+y*96+x];
  }

  // Return undefined if no arg
  // Return undefined if directory (or file) already exists
  // Return resolved name if successful
  syscall_mkdir(name) {
    systrace('mkdir', this, arguments);
    if (name === undefined)
      return undefined;
    name = resolve(this._cwd, name);
    var fname;
    if (name.charAt(name.length-1) !== '/') {
      fname = name;
      name += '/';
    } else {
      fname = name.slice(0, name.length-1);
    }
    if (filesystem[fskey(name)] || filesystem[fskey(fname)])
      return undefined;
    var walk = '';
    name.replace(/[^\/]*\//g, (match) => {
      walk += match;
      filesystem[fskey(walk)] = true;
    });
    return name;
  }

  syscall_mset(x, y, n) {
    x = floor(x), y = floor(y);
    this._os.mem[MRAM+y*96+x] = n;
  }

  // TODO support moving dirs, files into dirs, etc.
  syscall_mv(name1, name2) {
    systrace('mv', this, arguments);
    if (name1 === undefined || name2 === undefined)
      return undefined;
    name1 = resolve(this._cwd, name1);
    if (name1.charAt(name1.length-1) === '/')
      return undefined;
    if (filesystem[fskey(name1)] === undefined)
      return undefined;
    name2 = resolve(this._cwd, name2);
    if (name2.charAt(name2.length-1) === '/')
      return undefined;
    if (filesystem[fskey(name2)] !== undefined)
      return undefined;
    filesystem[fskey(name2)] = filesystem[fskey(name1)];
    delete filesystem[fskey(name1)];
    return name2;
  }

  // Sounds like open should create new file descriptor
  // but sometimes (spawn) you want to dup
  // https://stackoverflow.com/questions/5284062/two-file-descriptors-to-same-file

  syscall_open(filename, mode) {
    systrace('open', this, arguments);
    filename = resolve(this._cwd, filename);
    // TODO fix this mess
    filename = filename.slice(1);
    return fileOpen(filename, mode);
  }

  syscall_output(file) {
    systrace('output', this, arguments);
  }

  syscall_peek(addr) {
    return this._os.mem[addr];
  }

  syscall_pget(x, y) {
    x = floor(x), y = floor(y);
    return pget(this._os.mem,x, y);
  }

  syscall_poke(addr, val) {
    this._os.mem[addr] = val;
  }

  syscall_print(...args) {
    systrace('print', this, arguments);
    this.write(args.join(' ') + '\n');
  }

  syscall_pset(x, y, c) {
    x = floor(x), y = floor(y);
    const os = this._os, mem = os.mem, pal = os.pal;
    if (c != undefined) {
      os.c1 = c;
    } else {
      c = os.c1;
    }
    if (c != undefined)
      c = pal[c];
    if (c != undefined)
      pset(mem, x, y, c);
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
    
    const os = this._os;
    
    os.mem.fill(0, 0, CRAM);
    os.sys.memwrite(CRAM+32*8, CROM);
    
    os.sys._cwd = '/';
    
    // TEMP graphics state (not yet in memory map)
    os.c1 = 15; // primary color (index or undefined)
    os.c2 = undefined; // secondary color (index or undefined)
    os.pal = // palette map (index or undefined)
      [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 ];
    
    os.VC = []; // virtual consoles
    os.vc = os.VC; // current virtual console (temporarily not a vc)
    os.editor = 1; // index of most recently used editor
    this.vc(0);
  }

  syscall_rect(x, y, w, h, c1, c2) {
    x = floor(x), y = floor(y), w = floor(w), h = floor(h);
    if (w <= 0 || h <= 0)
      return;
    const os = this._os, mem = os.mem, pal = os.pal;
    if (c1 != undefined || c2 != undefined) {
      os.c1 = c1;
      os.c2 = c2;
    } else {
      c1 = os.c1;
      c2 = os.c2;
    }
    if (c1 != undefined)
      c1 = pal[c1];
    if (c2 != undefined)
      c2 = pal[c2];
    const x1 = x, x2 = x+w-1, y2 = y+h-1;
    if (c1 != undefined && c2 != undefined) {
      for (x = x1; x <= x2; ++x) {
        pset(mem, x, y, c2);
        pset(mem, x, y2, c2);
      }
      for (++y; y < y2; ++y) {
        pset(mem, x1, y, c2);
        for (x = x1; ++x < x2;)
          pset(mem, x, y, c1);
        pset(mem, x2, y, c2);
      }
    } else if (c1 != undefined) {
      for (; y <= y2; ++y)
        for (x = x1; x <= x2; ++x)
          pset(mem, x, y, c1);
    } else if (c2 != undefined) {
      for (x = x1; x <= x2; ++x) {
        pset(mem, x, y, c2);
        pset(mem, x, y2, c2);
      }
      for (++y; y < y2; ++y) {
        pset(mem, x1, y, c2);
        pset(mem, x2, y, c2);
      }
    }
  }

  // Return undefined if no arg
  // Return undefined if file does not exist
  // Return resolved name if successful
  syscall_rm(name) {
    systrace('rm', this, arguments);
    if (name === undefined)
      return undefined;
    name = resolve(this._cwd, name);
    if (name.charAt(name.length-1) === '/')
      return undefined;
    if (!filesystem[fskey(name)])
      return undefined;
    delete filesystem[fskey(name)];
    return name;
  }

  // Return undefined if no arg
  // Return undefined if directory does not exist
  // Return resolved name if successful
  syscall_rmdir(name) {
    systrace('rmdir', this, arguments);
    if (name === undefined)
      return undefined;
    name = resolve(this._cwd, name);
    if (name.charAt(name.length-1) !== '/')
      name += '/';
    if (!filesystem[fskey(name)])
      return undefined;
    const re = new RegExp(`^phosphor:${name}`);
    for (var key in filesystem)
      if (filesystem.hasOwnProperty(key) && re.test(key))
        delete filesystem[key];
    return name;
  }

  syscall_save() {
    systrace('save', this, arguments);
    const filesystem = this._os.filesystem;
    const mem = this._os.mem;
    var contents = window.program_code || '';
    var len;
    // sprite
    for (len = 0x2000; len > 0; --len) {
      if (mem[0x3000+len-1] != 0)
        break;
    }
    if (len > 0)
      contents += `--[[phosphor@3000=${this.memread(0x3000, len)}]]\n`
    // map
    for (len = 0x2400; len > 0; --len) {
      if (mem[0x5000+len-1] != 0)
        break;
    }
    if (len > 0)
      contents += `--[[phosphor@5000=${this.memread(0x5000, len)}]]\n`
    if (/\S/.test(contents)) {
      if (!window.program_handle) {
        var filename = 'untitled';
        for (var i = 1; ; ++i) {
          if (this.open(filename, 'r') === undefined) {
            break;
          }
          filename = `untitled-${i}`
        }
        window.program_handle = this.open(filename, 'w+');
      }
      filesystem[window.program_handle.key] = contents;
    } else if (window.program_handle) {
      this._os.filesystem[window.program_handle.key] = '';
    }
  }

  syscall_scale(scale) {
    systrace('scale', this, arguments);
    // TODO no args means return current scale
    // TODO error checking on inputs
    this._os.bspScreenScale(scale);
  }

  syscall_seek(fd, offset, whence) {
    systrace('seek', this, arguments);
    // TODO seek, but not for terminals
  }

  syscall_sget(n, x, y) {
    x = floor(x), y = floor(y);
    const mem = this._os.mem;
    const a = SRAM+(n<<5)+(y<<2)+(x>>1), s = (x&1)<<2;
    const b = mem[a];
    return (b>>s)&0xf;
  }

  syscall_spawn(...args) {
    systrace('spawn', this, arguments);
    const name = args[0];
    var M = mrom[name];
    if (!M) M = mrom[name] = require(`./${name}.js`);
    const process = new M();
    process.sys = Object.create(this._os.syscall);
    process.sys._name = name;
    process.sys._process = process;
    process.sys._parent = this._process;
    process.sys._cwd = this._cwd;
    process.sys._terminal = { terminal:this._os.vc }; // TODO get from parent
    process.sys._input = process.sys._terminal; // TODO get from parent (dup?)
    process.sys._output = process.sys._terminal; // TODO get from parent (dup?)
    // currently, wait for child like this:
    // const exitStatus = this.sys.spawn('prog', ...args).sys._main
    process.sys._main = new Promise((resolve, reject) => {
      resolve(process.main ? process.main(...args) : 0);
    });
    return process;
  }

  syscall_sprite(n, x, y) {
    x = floor(x), y = floor(y);
    const mem = this._os.mem;
    var a = SRAM+(n<<5), b;
    for (let Y = y+8; y < Y; ++y) {
      for (var j = 0; j < 8;) {
        b = mem[a++];
        pset(mem, x+j++, y, b&0xf);
        pset(mem, x+j++, y, b>>4);
      }
    }
  }

  syscall_sset(n, x, y, c) {
    x = floor(x), y = floor(y);
    const mem = this._os.mem;
    const a = SRAM+(n<<5)+(y<<2)+(x>>1), s = (x&1)<<2;
    const b = mem[a];
    mem[a] = (b&(0xf0>>s)) | (c<<s);
  }

  syscall_text(str, x, y, c1, c2) {
    x = floor(x), y = floor(y);
    const len = str.length;
    for (var i = 0; i < len; ++i, x+=5) {
      this.char(str.charAt(i), x, y, c1, c2);
    }
  }

  // Equivalent of linux openvt/chvt (TODO improve API)
  syscall_vc(id, process) {
    systrace('vc', this, arguments);
    const os = this._os;
    if (os.interval) {
      clearInterval(os.interval);
      delete os.interval;
    }
    if (os.vc.onSuspend) {
      os.vc.onSuspend();
    }
    if (process) {
      os.VC[id] = process; // TODO reparent process to _os
    }
    os.vc = os.VC[id];
    if (!os.vc) {
      os.vc = os.VC; // temporarily not a vc
      switch (id) {
        case 0:
          os.vc = this.spawn('terminal');
          os.vc.write("phosphor          type 'help' for help\n\n");
          os.vc.setProcess(this.spawn('shell'));
          break;
        case 1: os.vc = this.spawn('code-editor'); break;
        case 2: os.vc = this.spawn('sprite-editor'); break;
        case 3: os.vc = this.spawn('map-editor'); break;
        case 4: os.vc = this.spawn('sound-editor'); break;
        case 5: os.vc = this.spawn('music-editor'); break;
        case 8:
          os.vc = this.spawn('terminal');
          os.vc.write('micro terminal\n\n');
          break;
        case 9:
          os.vc = this.spawn('terminal');
          os.vc.write('micro shell\n\n');
          os.vc.setProcess(this.spawn('shell'));
          break;
      }
      os.VC[id] = os.vc;
    }
    if (1 <= id && id <= 5) {
      os.editor = id;
    }
    if (os.vc.onResume) {
      os.vc.onResume();
    }
    if (os.vc.onUpdate) {
      os.frame = 0;
      os.interval = setInterval(() => {
        try {
          os.vc.onUpdate();
          os.vc.onDraw();
        } catch (e) {
          os.sys.vc(0);
          return;
        }
        os.iomem.copyWithin(16, 0, 16);
        os.frame++;
      }, 1000/30);
    } else {
      os.onDraw();
    }
  }

  // write ([fd,] ...)
  // Writes the value of each of its arguments to handle. The arguments must be strings or numbers.
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

  // ---------------------------------------------------------------------------

  onCopy(e) {
    if (this.vc.onCopy) this.vc.onCopy(e);
    this.onDraw();
    e.preventDefault();
  }

  onCut(e) {
    if (this.vc.onCut) this.vc.onCut(e);
    this.onDraw();
    e.preventDefault();
  }

  onDraw() {
    if (this.vc.onDraw) this.vc.onDraw();
    this.bspScreenFlip(this.mem);
  }

  onFileImport(name, contents) {
    // HACK
    name = '/' + name.substr(name.lastIndexOf('/') + 1).replace('.lua', '');
    filesystem[fskey(name)] = contents;
  }

  onFsImport(name, contents) {
    // HACK
    var obj;
    try {
      obj = JSON.parse(contents);
    } catch (e) {
    }
    if (!obj)
      return;
    var key;
    for (key in filesystem)
      if (filesystem.hasOwnProperty(key))
        delete filesystem[key];
    for (key in obj)
      if (obj.hasOwnProperty(key))
        filesystem[key] = obj[key];
  }

  onKeyDown(e) {
    if (e.key == 'Escape') {
      this.sys.vc(this.vc == this.VC[0] ? this.editor : 0);
      e.preventDefault();
      return;
    }
    if (e.ctrlKey && !e.shiftKey && e.altKey && !e.metaKey) {
      switch (e.key) {
        case '`': this.sys.vc(0); e.preventDefault(); return;
        case '1': this.sys.vc(1); e.preventDefault(); return;
        case '2': this.sys.vc(2); e.preventDefault(); return;
        case '3': this.sys.vc(3); e.preventDefault(); return;
        case '4': this.sys.vc(4); e.preventDefault(); return;
        case '5': this.sys.vc(5); e.preventDefault(); return;
        case '8': this.sys.vc(8); e.preventDefault(); return;
        case '9': this.sys.vc(9); e.preventDefault(); return;
        case '0': this.sys.vc(10); e.preventDefault(); return;
      }
    }
    if (true) {
      const code = jsKeyCodes[e.code];
      if (code !== undefined)
        bitset(this.iomem, 0, code);
    }
    if (e.ctrlKey || e.altKey || e.metaKey) {
      return;
    }
    if (this.vc.onKeyDown) {
      this.vc.onKeyDown(e);
      this.onDraw();
    }
    e.preventDefault();
  }

  onKeyUp(e) {
    const code = jsKeyCodes[e.code];
    if (code !== undefined)
      bitclear(this.iomem, 0, code);
  }

  onMouseClick(e) {
    if (this.vc.onMouseClick) this.vc.onMouseClick(e);
    this.onDraw();
  }

  onPaste(e) {
    if (this.vc.onPaste) this.vc.onPaste(e);
    this.onDraw();
    e.preventDefault();
  }

  onPointerDown(e) {
    if (this.vc.onPointerDown) this.vc.onPointerDown(e);
    else if (this.vc.onMouseDown) this.vc.onMouseDown(e); // TODO remove later
    this.onDraw();
  }

  onPointerMove(e) {
    if (this.vc.onPointerMove) this.vc.onPointerMove(e);
    else if (this.vc.onMouseMove) this.vc.onMouseMove(e); // TODO remove later
    this.onDraw();
  }

  onPointerUp(e) {
    if (this.vc.onPointerUp) this.vc.onPointerUp(e);
    else if (this.vc.onMouseUp) this.vc.onMouseUp(e); // TODO remove later
    this.onDraw();
  }

  onWheel(e) {
    // Firefox can give 0.75 always so fix it up
    if (abs(e.deltaX) == 0.75)
      e.deltaX *= 4/3;
    if (abs(e.deltaY) == 0.75)
      e.deltaY *= 4/3;
    if (this.vc.onWheel) this.vc.onWheel(e);
    this.onDraw();
  }

  // bsp -----------------------------------------------------------------------

  // NOTE currently using bsp_blah for bsp-private storage

  bspAudioBeep() {console.log('bspAudioBeep')}

  bspExport(name, contents) {console.log('bspExport')}

  bspImport() {console.log('bspImport')}

  bspImportFs() {console.log('bspImportFs')}

  bspScreenFlip(mem) {console.log('bspScreenFlip')}

  bspScreenScale(scale) {console.log('bspScreenScale')}

};
