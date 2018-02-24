// Simple computer
// Marc Lepage, Fall 2017

'use strict';

const helpText = `help   - show commands
mkdir  - make directory
rmdir  - remove directory
cd     - change directory
ls     - list files in directory
load   - load program file
run    - run program file
export - save filesystem to host
import - load filesystem from host
scale  - change host scale factor
reboot - reboot computer

ESC    - toggle console/editor
CTRL+0 - console (command line)
CTRL+1 - code editor
CTRL+2 - sprite editor
CTRL+3 - map editor
CTRL+4 - sound editor
CTRL+5 - music editor
`;

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
    this.sys.export();
  }

  async builtin_help(...args) {
    this.sys.write(helpText);
  }

  async builtin_import(...args) {
    this.sys.import();
  }

  async builtin_load(...args) {
    this.sys.load(args[1]);
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

  async builtin_reboot(...args) {
    this.exit = true;
    this.sys.reboot();
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

  async builtin_scale(...args) {
    this.sys.scale(args[1]);
  }

};
