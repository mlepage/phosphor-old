// Phosphor - a browser-based microcomputer
// Copyright (c) 2017-2018 Marc Lepage

'use strict';

const floor = Math.floor;

module.exports = class Prog2 {

  main() {
    console.log('prog2 main');
    this.t = 0;
  }

  draw() {
    let t = this.t;
    const P = this.P;
    P.clear();
    const x = floor(120-8+64*Math.cos(t*Math.PI/180));
    const y = floor(80-8+64*Math.sin(t*Math.PI/180));
    P.box(x, y, 16, 16, t%60);
    /*
    for (let i = 0; i < 38400; ++i) {
      P.poke(i, 13);
    }
    */
  }

  onKeyDown(e) {
    console.log('prog2 key', e);
    if (e.key == ' ')
      this.t = 0;
  }

  update() {
    this.t = (this.t+1)%360;
  }

};
