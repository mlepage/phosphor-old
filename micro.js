// Simple computer
// Marc Lepage, Fall 2017

'use strict';

const floor = Math.floor;

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

const VRAM = 0x0000; // video ram (12K)
const SRAM = 0x3000; // sprite ram (8K)
const MRAM = 0x5000; // map ram (9K)
const CRAM = 0x8000; // character ram (1K)
const URAM = 0x8400; // ui sprite ram (1K)
const W = 192; // for graphics
const H = 128; // for graphics

// Character ROM, 8 bytes per 128 characters
// Each byte is one row, each bit (LSB to MSB) is one col (left to right)
// Last 8 bytes (char 127 DEL) are width/height bytes for 4 banks of 32 chars
const CROM = '00000000000000000004040400040000000a0a0000000000000a0e0a0e0a0000000e060c0e040000000a0804020a000000040a060a16000000040400000000000008040404080000000408080804000000000a040a0000000000040e0400000000000000000402000000000e0000000000000000000400000010180c06020000000c1a16120c000000040604040e0000000e100c021e0000000e100c100e0000000a0a1e08080000001e020e100e0000001c020e120c0000001e100804040000000c120c120c0000000c121c100c000000000004000400000000000400040200000804020408000000000e000e0000000004081008040000000e100c00040000000c121a021c0000000c12121e120000000e120e120e0000000c1202120c0000000e1212120e0000001e020e021e0000001e020e02020000001c021a121c00000012121e12120000000e0404040e0000001c1010120c000000120a060a12000000020202021e0000001e1a12121200000012161a12120000000c1212120c0000000e12120e020000000c1212120c1000000e12120e120000001c020c100e0000001e04040404000000121212120c0000001212120a04000000121212161e00000012120c121200000012121c100c0000001e1008041e0000000c0404040c00000002060c18100000000c0808080c000000040a000000000000000000001e0000000004080000000000001c12121c000000020e12120e000000001c02021c000000101c12121c000000000c1a060c00000018041e0404000000000c121c100c0000020e12121200000008000c081c00000010001810120c000002120e12120000000604040418000000001e1a1212000000000e121212000000000c12120c000000000e12120e020000001c12121c100000001c020202000000001c04080e000000041e040418000000001212120c0000000012120a04000000001212161e00000000120c12120000000012121c100c0000001e08041e0000000c0406040c00000004040404040000000c0818080c00000000140a000000000808050705070507';

const mrom = {}; // module rom

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
    localStorage.setItem('mcomputer', 'test');
    const result = localStorage.getItem('mcomputer') == 'test';
    localStorage.removeItem('mcomputer');
    return result;
  } catch(e) {
    return false;
  }
}

// Returns filesystem key, assuming absolute name
function fskey(name) {
  return `mcomputer:${name}`;
}

const filesystem = localStorageAvailable() ? localStorage : {};
filesystem[fskey('/')] = true;
filesystem[fskey('/hello')] = demoHello;
filesystem[fskey('/bounce')] = demoBounce;

// File handle looks like: { file:'/full/path/name', key:'mcomputer:/full/path/name', mode:'r+', pos:123 }
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
  const key = `mcomputer:/${filename}`;
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

module.exports = class Micro {

  constructor() {
    // TODO probably should go into a device profile
    // and be exposed to both bsp and to processes
    this.w = 192; // screen width
    this.h = 128; // screen height
    this.cw = 5; // char width
    this.ch = 7; // char height
    
    this.filesystem = filesystem; // HACK
    
    // TODO syscall object could probably be global (reuse per computer)
    this.syscall = { _os:this };
    // https://stackoverflow.com/questions/37771418/iterate-through-methods-and-properties-of-an-es6-class
    const names = Object.getOwnPropertyNames(Micro.prototype);
    for (let name of names)
      if (/^syscall_/.test(name))
        this.syscall[name.slice(8)] = this[name];
    
    this.sys = Object.create(this.syscall);
    this.sys._process = this;
  }

  async reboot() {
    this.sys._cwd = '/';
    
    this.mem = new Uint8Array(0x9000); // 32 KiB RAM + 4 KiB ROM
    
    // TEMP load memory image from hardcoded file
    delete this.sys._os.filesystem['mcomputer:mem'];
    //const memstr = this.sys._os.filesystem['mcomputer:mem'];
    //if (memstr)
    //  this.sys.memwrite(0x3000, memstr);
    
    // character rom
    this.sys.memwrite(CRAM+32*8, CROM);
    
    // ui sprites
    this.sys.memwrite(URAM+1*32, '0000000000330330003000300030003000300030003000300033033000000000');
    this.sys.memwrite(URAM+2*32, '0000000000333300033333300303303003333330033003300033330000000000');
    this.sys.memwrite(URAM+3*32, '0000000003300330033333300030030000300300033333300330033000000000');
    this.sys.memwrite(URAM+4*32, '0000000000003000003030000033303000333330033333300333333000000000');
    this.sys.memwrite(URAM+5*32, '0000000000333300003003000030030000300300033033000330330000000000');
    
    this.keystate = [0, 0, 0, 0]; // 32 bits each
    
    // TEMP graphics state (not yet in memory map)
    this.c1 = 15; // primary color (index or undefined)
    this.c2 = undefined; // secondary color (index or undefined)
    this.pal = // palette map (index or undefined)
      [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 ];
    
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

  syscall_gpixel(x, y, c) {
    systrace('gpixel', this, arguments);
    pset(this._os.mem, x, y, c);
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
    systrace('key', this, arguments);
    if (typeof keycode == 'string') {
      keycode = keycode.charCodeAt();
    }
    const i = floor(keycode/32);
    const mask = 1 << (keycode%32);
    return (this._os.keystate[i] & mask) !== 0;
  }

  syscall_load(filename) {
    systrace('load', this, arguments);
    const handle = fileOpen(filename, 'r');
    this.memset(0x3000, 0, 0x5000);
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
    const len = 10 + name.length;
    const re = new RegExp(`^mcomputer:${name}[^/]+/?$`);
    for (var key in filesystem)
      if (filesystem.hasOwnProperty(key) && re.test(key))
        list.push(key.slice(len));
    return list;
  }

  syscall_map(sx, sy, x, y, w, h) {
    const x_ = x, y_ = y;
    for (y = 0; y < h; ++y)
      for (x = 0; x < w; ++x)
        this.spr(this.mget(x_+x, y_+y), sx+(x<<3), sy+(y<<3));
  }

  syscall_mget(x, y) {
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

  syscall_rect(x, y, w, h, c1, c2) {
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
    const re = new RegExp(`^mcomputer:${name}`);
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

  syscall_spr(n, x, y) {
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
    const mem = this._os.mem;
    const a = SRAM+(n<<5)+(y<<2)+(x>>1), s = (x&1)<<2;
    const b = mem[a];
    mem[a] = (b&(0xf0>>s)) | (c<<s);
  }

  syscall_text(str, x, y, c1, c2) {
    const len = str.length;
    for (var i = 0; i < len; ++i, x+=5) {
      this.char(str.charAt(i), x, y, c1, c2);
    }
  }

  syscall_uget(n, x, y) {
    const mem = this._os.mem;
    const a = URAM+(n<<5)+(y<<2)+(x>>1), s = (x&1)<<2;
    const b = mem[a];
    return (b>>s)&0xf;
  }

  syscall_uset(n, x, y, c) {
    const mem = this._os.mem;
    const a = URAM+(n<<5)+(y<<2)+(x>>1), s = (x&1)<<2;
    const b = mem[a];
    mem[a] = (b&(0xf0>>s)) | (c<<s);
  }

  syscall_uspr(n, x, y) {
    const mem = this._os.mem;
    var a = URAM+(n<<5), b, c;
    for (let Y = y+8; y < Y; ++y) {
      for (var j = 0; j < 8; j+=2) {
        b = mem[a++];
        c = b&0xf;
        if (c != 0)
          pset(mem, x+j, y, c);
        c = b>>4;
        if (c != 0)
          pset(mem, x+j+1, y, c);
      }
    }
  }

  // Equivalent of linux openvt/chvt (TODO improve API)
  syscall_vc(id, process) {
    systrace('vc', this, arguments);
    this._os.virtualConsole(id, process);
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

  // memory --------------------------------------------------------------------

  syscall_memcpy(dest_addr, source_addr, len) {
    this._os.mem.copyWithin(dest_addr, source_addr, source_addr+len);
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

  syscall_memset(dest_addr, val, len) {
    this._os.mem.fill(val, dest_addr, dest_addr+len);
  }

  syscall_memwrite(addr, str) {
    const mem = this._os.mem;
    for (var i = 0, len = str.length&~1; i < len; i+=2) {
      mem[addr++] = (fromHex[str.charAt(i)]<<4) | fromHex[str.charAt(i|1)];
    }
  }

  syscall_peek(addr) {
    return this._os.mem[addr];
  }

  syscall_poke(addr, val) {
    this._os.mem[addr] = val;
  }

  // ---------------------------------------------------------------------------

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
    if (e.key.length == 1) {
      const keycode = e.key.charCodeAt();
      const i = floor(keycode/32);
      const mask = 1 << (keycode%32);
      this.keystate[i] |= mask;
    }
    if (this.vc.onKeyDown) this.vc.onKeyDown(e);
    e.preventDefault();
    this.onDraw();
  }

  onKeyUp(e) {
    if (e.key.length == 1) {
      const keycode = e.key.charCodeAt();
      const i = floor(keycode/32);
      const mask = 1 << (keycode%32);
      this.keystate[i] &= ~mask;
    }
  }

  onMouseClick(e) {
    if (this.vc.onMouseClick) this.vc.onMouseClick(e);
    //e.preventDefault();
    this.onDraw();
  }

  onMouseDown(e) {
    if (this.vc.onMouseDown) this.vc.onMouseDown(e);
    //e.preventDefault();
    this.onDraw();
  }

  onMouseMove(e) {
    if (this.vc.onMouseMove) this.vc.onMouseMove(e);
    //e.preventDefault();
    this.onDraw();
  }

  onMouseUp(e) {
    if (this.vc.onMouseUp) this.vc.onMouseUp(e);
    //e.preventDefault();
    this.onDraw();
  }

  onWheel(e) {
    if (this.vc.onMouseWheel) this.vc.onMouseWheel(e);
    //e.preventDefault();
    this.onDraw();
  }

  // bsp -----------------------------------------------------------------------

  // NOTE currently using bsp_blah for bsp-private storage

  bspAudioBeep() {console.log('bspAudioBeep')}

  bspExport(name, contents) {console.log('bspExport')}

  bspImport() {console.log('bspImport')}

  bspImportFs() {console.log('bspImportFs')}

  bspScreenChar(ch, x, y, fg, bg) {console.log('bspScreenChar')}

  bspScreenClear(c) {console.log('bspScreenClear')}

  bspScreenPixel(x, y, c) {console.log('bspScreenPixel')}

  bspScreenRect(x, y, w, h, c) {console.log('bspScreenRect')}

  bspScreenRectO(x, y, w, h, c) {console.log('bspScreenRectO')}

  bspScreenScale(scale) {console.log('bspScreenScale')}

};
