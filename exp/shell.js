// Phosphor - a browser-based microcomputer
// Copyright (c) 2017-2018 Marc Lepage

'use strict';

module.exports = class Shell {

  async main(...args) {
    const P = this.P;
    
    const login = args[1] == 'login';
    const interactive = true; // TODO
    const prompt = '\x1bB>\x1bA ';
    
    if (login) {
      P.write("\x1bBphosphor\x1bA            \x1bCtype 'help' for help\x1bA\n\n");
    }
    
    while (true) {
      if (interactive) {
        P.write(prompt);
      }
      const line = await P.read();
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
    const P = this.P;
    // TODO handle commands
    switch(args[0]) {
      case 'colortest':
        P.write('\x1bAwhite  \x1bBgreen  \x1bCamber  \x1bDred  \x1bA\n');
        break;
      case 'logtest':
        P.write('\x1bAsomething happened\n');
        P.write('\x1bCwarning: maybe something bad?\n');
        P.write('\x1bAanother thing happened\n');
        P.write('\x1bCwarning: approaching limits\n');
        P.write('\x1bDerror: limits exceeded\n');
        P.write('\x1bAretrying the thing\n');
        break;
      case 'testtest':
        P.write('\x1bC--> open\n');
        P.write('\x1bE  OK  \x1bB file opens\n');
        P.write('\x1bE  OK  \x1bB file has permissions\n');
        P.write('\x1bC--> spawn\n');
        P.write('\x1bE  OK  \x1bB child spawns\n');
        P.write('\x1bE  OK  \x1bB child has ppid\n');
        P.write('\x1bF FAIL \x1bD child lacks parent FDs\n');
        break;
      case 'fonttest':
        P.write('\x1bBABCDEFGHIJKLMNOPQRSTUVWXYZ\n');
        P.write('abcdefghijklmnopqrstuvwxyz\n');
        P.write('\x1bC0123456789  x=(a+b)/(c-d)*(4*y[z]%3)\n');
        P.write('\x1bBthe quick brown fox jumps over the\n');
        P.write('lazy dog \x1bCand then \x1bBthe quick onyx goblin\n');
        P.write('jumps over the lazy dwarf ,. ;: !? \'"\n');
        P.write('\x1bCsphinx of black quartz, judge my vow\n');
        P.write('\x1bBthe rain in spain falls mainly on plains\n');
        P.write('\x1bCif you\'re happy and you know it say yay\n');
        P.write('\x1bBit\'s the end of the world as we know it\n');
        P.write('\x1bCfun in the sun getting a tan on the sand\n');
        P.write('\x1bBhelpful creatures sense natural enemies\n');
        P.write('\x1bCINFINITE HIJINX RESULTS IN HIJACKINGS\n');
        P.write('\x1bBFUNCTION OF VELVET UNDULATES ENSUES\n');
        P.write('\x1bCIS THIS A DAGGER I SEE BEFORE ME?\n');
        break;
      case 'cat':
        P.write('\x1bBL: We have no time to spare, Didact.\n');
        P.write('Every vessel we can fill, we send to\n');
        P.write('the Ark. I dare not cease the\n');
        P.write('mission. Not now, not until I\'ve\n');
        P.write('done all I can. Each one of these\n');
        P.write('souls is finite and precious.\n');
        P.write('And I\'m close.\n');
        P.write('Close to saving them all.\n');
        P.write('//FRAGMENT ENDS\x1bA\n');
        break;
      default:
        P.write(`input: '${line}'\n`);
    }
  }

};
