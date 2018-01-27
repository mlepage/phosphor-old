// Simple computer
// Marc Lepage, Winter 2017

'use strict';

module.exports = class Cat {

  async main() {
    // TODO support some kind of ctrl-D
    this.sys.print("type lines ('exit' to exit)");
    // TODO use sys.read('L') when supported
    while (true) {
      const line = await this.sys.read();
      if (line === undefined) break;
      if (line == 'exit') // TEMP until ctrl-D works
        break;
      this.sys.write(`${line}\n`);
    }
  }

};
