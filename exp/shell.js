// Phosphor - a browser-based microcomputer
// Copyright (c) 2017-2018 Marc Lepage

'use strict';

const helptext =
`\x1bBrun\x1bA  run program
\x1bBlua\x1bA  run lua interpreter
`;

module.exports = class Shell {

  async main(...args) {
    const P = this.P;
    
    const login = args[1] == 'login';
    const interactive = true; // TODO
    const prompt = '\x1bB>\x1bA ';
    
    if (login) {
      P.write(1, "\x1bBphosphor\x1bA            \x1bCtype 'help' for help\x1bA\n\n");
    }
    
    while (true) {
      if (interactive) {
        P.write(1, prompt);
      }
      const line = await P.read(0);
      //if (line === undefined) break; // only needed when reading from file
      await this.execute(line);
      // TODO handle check for exit (for scripts)
    }
  }

  async execute(line) {
    const args = line.match(/\S+/g);
    if (!args) {
      return;
    }
    const builtin = `builtin_${args[0]}`;
    if (this[builtin]) {
      return this[builtin](...args);
    }
    const P = this.P;
    // TODO handle commands
    switch(args[0]) {
      case 'colortest':
        P.write(1, '\x1bAwhite  \x1bBgreen  \x1bCamber  \x1bDred  \x1bA\n');
        break;
      case 'logtest':
        P.write(1, '\x1bAsomething happened\n');
        P.write(1, '\x1bCwarning: maybe something bad?\n');
        P.write(1, '\x1bAanother thing happened\n');
        P.write(1, '\x1bCwarning: approaching limits\n');
        P.write(1, '\x1bDerror: limits exceeded\n');
        P.write(1, '\x1bAretrying the thing\n');
        break;
      case 'testtest':
        P.write(1, '\x1bC--> open\n');
        P.write(1, '\x1bE  OK  \x1bB file opens\n');
        P.write(1, '\x1bE  OK  \x1bB file has permissions\n');
        P.write(1, '\x1bC--> spawn\n');
        P.write(1, '\x1bE  OK  \x1bB child spawns\n');
        P.write(1, '\x1bE  OK  \x1bB child has ppid\n');
        P.write(1, '\x1bF FAIL \x1bD child lacks parent FDs\n');
        break;
      case 'fonttest':
        P.write(1, '\x1bBABCDEFGHIJKLMNOPQRSTUVWXYZ\n');
        P.write(1, 'abcdefghijklmnopqrstuvwxyz\n');
        P.write(1, '\x1bC0123456789  x=(a+b)/(c-d)*(4*y[z]%3)\n');
        P.write(1, '\x1bBthe quick brown fox jumps over the\n');
        P.write(1, 'lazy dog \x1bCand then \x1bBthe quick onyx goblin\n');
        P.write(1, 'jumps over the lazy dwarf ,. ;: !? \'"\n');
        P.write(1, '\x1bCsphinx of black quartz, judge my vow\n');
        P.write(1, '\x1bBthe rain in spain falls mainly on plains\n');
        P.write(1, '\x1bCif you\'re happy and you know it say yay\n');
        P.write(1, '\x1bBit\'s the end of the world as we know it\n');
        P.write(1, '\x1bCfun in the sun getting a tan on the sand\n');
        P.write(1, '\x1bBhelpful creatures sense natural enemies\n');
        P.write(1, '\x1bCINFINITE HIJINX RESULTS IN HIJACKINGS\n');
        P.write(1, '\x1bBFUNCTION OF VELVET UNDULATES ENSUES\n');
        P.write(1, '\x1bCIS THIS A DAGGER I SEE BEFORE ME?\n');
        break;
      case 'cat':
        P.write(1, '\x1bBL: We have no time to spare, Didact.\n');
        P.write(1, 'Every vessel we can fill, we send to\n');
        P.write(1, 'the Ark. I dare not cease the\n');
        P.write(1, 'mission. Not now, not until I\'ve\n');
        P.write(1, 'done all I can. Each one of these\n');
        P.write(1, 'souls is finite and precious.\n');
        P.write(1, 'And I\'m close.\n');
        P.write(1, 'Close to saving them all.\n');
        P.write(1, '//FRAGMENT ENDS\x1bA\n');
        break;
      default:
        P.write(1, `input: '${line}'\n`);
    }
  }

  async builtin_help(...args) {
    this.P.write(1, helptext);
  }

  async builtin_load(...args) {
    // TODO
  }

  async builtin_ls(...args) {
    const P = this.P;
    const list = P.ls();
    for (let i = 0; i < list.length; ++i)
      P.write(0, list[i], '\n');
  }

  async builtin_lua(...args) {
    return this.P.spawn(...args)._.main_promise;
  }

  async builtin_rm(...args) {
    // TODO
  }

  async builtin_run() {
    // TODO this should run the loaded cart (using Lua)
    this.P.write(1, 'RUN COMMAND ENGAGED\n');
  }

};
