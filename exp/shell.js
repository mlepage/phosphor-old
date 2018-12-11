// Phosphor - a browser-based microcomputer
// Copyright (c) 2017-2018 Marc Lepage

'use strict';

const helptext =
`\x1bBlist\x1bA         list files
\x1bBshow\x1bC file\x1bA    show file contents
\x1bBload\x1bC file\x1bA    load file as program
\x1bBsave\x1bC file\x1bA    save file as copy
\x1bBnew\x1bC file\x1bA     new empty file
\x1bBdelete\x1bC file\x1bA  delete file
\x1bBrun\x1bA          run loaded program
`;

module.exports = class Shell {

  constructor() {
    // TODO find best way to create aliases for builtins
    const p = Object.getPrototypeOf(this);
    p.builtin_cat = p.builtin_show;
    p.builtin_del = p.builtin_delete;
    p.builtin_dir = p.builtin_list;
    p.builtin_ls = p.builtin_list;
    p.builtin_remove = p.builtin_delete;
    p.builtin_rm = p.builtin_delete;
  }

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
    if (!args)
      return;
    const builtin = `builtin_${args[0]}`;
    if (this[builtin])
      return this[builtin](...args);
    this.P.write(1, '\x1bCcommand not found\x1bA\n');
  }

  async builtin_delete(...args) {
    // TODO
  }

  async builtin_help(...args) {
    this.P.write(1, helptext);
  }

  async builtin_list(...args) {
    const P = this.P;
    args.shift();
    if (args.length != 0) {
      P.write(1, '\x1bCtoo many files specified\x1A\n');
      return;
    }
    const list = P.ls();
    for (let i = 0; i < list.length; ++i)
      P.write(0, list[i], '\n');
  }

  async builtin_load(...args) {
    const P = this.P;
    args.shift();
    if (args.length != 1) {
      P.write(1, args.length == 0 ? '\x1bCno program specified\x1A\n'
                                  : '\x1bCtoo many programs specified\x1A\n');
      return;
    }
    const r = P.load(args[0]);
    P.write(1, r == 0 ? '\x1bBprogram loaded\x1bA\n'
                      : '\x1bCno such program\x1bA\n');
  }

  async builtin_lua(...args) {
    const P = this.P;
    args.shift();
    if (args.length < 1) {
      P.write(1, '\x1bCno script specified\x1A\n');
      return;
    }
    return P.spawn(...args)._.main_promise;
  }

  async builtin_new(...args) {
    // TODO
  }

  async builtin_run(...args) {
    const P = this.P;
    args.shift();
    if (args.length != 0) {
      P.write(1, '\x1bCtoo many programs specified\x1A\n');
      return;
    }
    return P.spawn('lua', P.load())._.main_promise;
  }

  async builtin_save(...args) {
    // TODO
  }

  async builtin_show(...args) {
    const P = this.P;
    args.shift();
    if (args.length != 1) {
      P.write(1, args.length == 0 ? '\x1bCno file specified\x1A\n'
                                  : '\x1bCtoo many files specified\x1A\n');
      return;
    }
    const fd = P.open(args[0], 'r');
    if (fd == -1) {
      P.write(1, '\x1bCno such file\x1bA\n');
      return;
    }
    // TODO read entire file ('a')
    while (true) {
      const line = await P.read(fd);
      if (!line)
        break;
      P.write(1, line, '\n');
    }
  }

  async builtin_test() {
    const P = this.P;
    const n = Math.floor(Math.random()*5);
    switch (n) {
      case 0:
        P.write(1, '\x1bAwhite  \x1bBgreen  \x1bCamber  \x1bDred  \x1bA\n');
        break;
      case 1:
        P.write(1, '\x1bAsomething happened\n');
        P.write(1, '\x1bCwarning: maybe something bad?\n');
        P.write(1, '\x1bAanother thing happened\n');
        P.write(1, '\x1bCwarning: approaching limits\n');
        P.write(1, '\x1bDerror: limits exceeded\n');
        P.write(1, '\x1bAretrying the thing\n');
        break;
      case 2:
        P.write(1, '\x1bC--> open\n');
        P.write(1, '\x1bE  OK  \x1bB file opens\n');
        P.write(1, '\x1bE  OK  \x1bB file has permissions\n');
        P.write(1, '\x1bC--> spawn\n');
        P.write(1, '\x1bE  OK  \x1bB child spawns\n');
        P.write(1, '\x1bE  OK  \x1bB child has ppid\n');
        P.write(1, '\x1bF FAIL \x1bD child lacks parent FDs\n');
        break;
      case 3:
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
      case 4:
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
    }
  }

};
