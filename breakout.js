// Simple computer
// Marc Lepage, Winter 2017

'use strict';

var f = 0;
var g = 0;

module.exports = class Breakout {

  async main() {
    this.x = 0;
    this.y = 0;
    this.dx = 2;
    this.dy = 1;
  }

  // ---------------------------------------------------------------------------

  onDraw() {
    //this.sys.gclear(3);
    //this.sys.grect(this.x-5, this.y-5, 10, 10, 15);
    this.sys.clear(1);
    //this.sys.pal(15, 14, g%2 == 0);
    //this.sys.pset(this.x, this.y, 15);
    this.sys.rect(this.x-4, this.y-4, 8, 8, 9);
  }

  onKeyDown(e) {
  }

  onUpdate() {
    this.x += this.dx;
    this.y += this.dy;
    if (this.x <= 0 || 192 <= this.x) this.dx = -this.dx;
    if (this.y <= 0 || 128 <= this.y) this.dy = -this.dy;
    
    if (++f == 30) { f = 0; if (++g == 16) g = 0; }
  }

};
