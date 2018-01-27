// Simple computer
// Marc Lepage, Fall 2017

'use strict';

const helpText = `cat    - test js program
echo   - test command
export - save your program to host
import - load your program from host
lua    - test lua program
run    - run your lua program

ESC    - toggle editor
CTRL+0 - console
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
      const line = await this.sys.read('a', 'b', 'c');
      //if (line === undefined) break; // only needed when reading from file
      await this.process(line);
    }
    
    alert('shell exited');
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

  async builtin_lua(...args) {
    const process = this.sys.spawn('lua', ...args);
    await process.sys._main;
    if (process.onUpdate) {
      this.sys.vc(7, process);
    }
  }

  async builtin_run(...args) {
    await this.sys.spawn('lua').sys._main;
  }

};
