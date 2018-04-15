// Phosphor - a browser-based microcomputer
// Copyright (c) 2017-2018 Marc Lepage

'use strict';

const helpText = `help     - show commands
mkdir    - make directory
rmdir    - remove directory
cd       - change directory
ls       - list files in directory
mv       - move file
rm       - remove file
load     - load program file
run      - run program file
export   - save file to host
import   - load file from host
exportfs - save filesystem to host
importfs - load filesystem from host
scale    - change host scale factor

ESC      - toggle console/editor
CTRL+0   - console (command line)
CTRL+1   - code editor
CTRL+2   - sprite editor
CTRL+3   - map editor
CTRL+4   - sound editor
CTRL+5   - music editor
`;

function sprite2char(sys, n) {
  var a = 0x8000+(n<<3);
  for (var y = 0; y < 8; ++y) {
    var b = 0;
    for (var x = 0; x < 8; ++x) {
      const c = sys.sget(n, x, y);
      if (c)
        b |= (1<<x);
    }
    sys.poke(a++, b);
  }
}

function char2sprite(sys, n) {
  var a = 0x8000+(n<<3);
  for (var y = 0; y < 8; ++y) {
    var b = sys.peek(a++);
    for (var x = 0; x < 8; ++x, b>>>=1) {
      const c = (b&1)*15
      sys.sset(n, x, y, c);
    }
  }
}

module.exports = class Shell {

  async main() {
    const interactive = true;
    const prompt = '> ';
    
    while (true) {
      if (interactive) {
        this.sys.write(prompt);
      }
      const line = await this.sys.read();
      //if (line === undefined) break; // only needed when reading from file
      await this.process(line);
      if (this.exit)
        break;
    }
    
    console.log('shell exited');
  }

  async process(line) {
    const args = line.match(/\S+/g);
    if (!args) {
      return;
    }
    const cmd = args[0];
    const builtin = `builtin_${cmd}`;
    if (this[builtin]) {
      await this[builtin].apply(this, args);
    } else {
      this.sys.write(`${cmd}: command not found\n`);
    }
  }

  // ---------------------------------------------------------------------------

  async builtin_cat(...args) {
    await this.sys.spawn('cat').sys._main;
  }

  async builtin_cd(...args) {
    args.shift();
    const result = this.sys.cd(args.shift());
    this.sys.write(result || 'no such directory', '\n');
  }

  async builtin_echo(...args) {
    args.shift();
    this.sys.print(...args);
  }

  async builtin_export(...args) {
    args.shift();
    const result = this.sys.export(...args);
    this.sys.write(result ? 'exported' : 'no such file', '\n');
  }

  async builtin_exportfs(...args) {
    args.shift();
    this.sys.exportfs(...args);
  }

  async builtin_help(...args) {
    this.sys.write(helpText);
  }

  async builtin_import(...args) {
    args.shift();
    this.sys.import(...args);
  }

  async builtin_importfs(...args) {
    // TODO check for user confirmation
    args.shift();
    this.sys.importfs(...args);
  }

  async builtin_load(...args) {
    args.shift();
    this.sys.load(...args);
  }

  async builtin_loadcs(...args) {
    args.shift();
    const sys = this.sys;
    for (var n = 0; n < 128; ++n)
      char2sprite(sys, n);
    console.log(sys.memread(0x8000, 32*8));
    console.log(sys.memread(0x8000+32*8, 96*8));
  }

  async builtin_ls(...args) {
    args.shift();
    const result = this.sys.ls(args.shift());
    if (result === undefined)
      this.sys.write('no such directory\n');
    else
      for (var i = 0; i < result.length; ++i)
        this.sys.write(result[i], '\n');
  }

  async builtin_mkdir(...args) {
    args.shift();
    const result = this.sys.mkdir(args.shift());
    this.sys.write(result ? 'directory made' : 'cannot make directory', '\n');
  }

  async builtin_mv(...args) {
    args.shift();
    const result = this.sys.mv(args.shift(), args.shift());
    this.sys.write(result ? 'file moved' : 'cannot move file', '\n');
  }

/* TODO disabled for now (dangerous when using window global)
  async builtin_reboot(...args) {
    this.exit = true;
    this.sys.reboot();
  }
*/

  async builtin_rm(...args) {
    args.shift();
    const result = this.sys.rm(args.shift());
    this.sys.write(result ? 'file removed' : 'no such file', '\n');
  }

  async builtin_rmdir(...args) {
    args.shift();
    const result = this.sys.rmdir(args.shift());
    this.sys.write(result ? 'directory removed' : 'no such directory', '\n');
  }

  async builtin_run(...args) {
    args.shift();
    const process = this.sys.spawn('lua', ...args);
    await process.sys._main;
    if (process.onUpdate)
      this.sys.vc(7, process);
  }

  async builtin_savecs(...args) {
    args.shift();
    const sys = this.sys;
    for (var n = 0; n < 128; ++n)
      sprite2char(sys, n);
    console.log(sys.memread(0x8000, 32*8));
    console.log(sys.memread(0x8000+32*8, 96*8));
  }

  async builtin_scale(...args) {
    args.shift();
    if (args.length == 0) {
      this.sys.write('usage: scale <factor>\n');
    } else {
      const factor = args.shift();
      if (isNaN(Number(factor))) {
        this.sys.write('not a number\n');
      } else {
        this.sys.scale(factor);
        this.sys.write('scale applied\n');
      }
    }
  }

};
