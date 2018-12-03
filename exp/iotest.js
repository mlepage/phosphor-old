// Phosphor - a browser-based microcomputer
// Copyright (c) 2018 Marc Lepage

'use strict';

module.exports = class IoTest {

  async main(...args) {
    const P = this.P;
    
    console.log('io <<<');
    while (true) {
      console.log('io await read');
      const line = await P.read(0);
      console.log('io line:', line);
      if (line === undefined || line == '')
        break;
      P.write(1, line, '\n');
    }
    console.log('>>> io');
  }

};
