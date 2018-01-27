// Simple computer
// Marc Lepage Fall 2017

'use strict';

module.exports = class SpriteEditor {

  // ---------------------------------------------------------------------------

  onDraw() {
    this.sys.gclear(0);
    this.sys.grect(0, 0, 192, 8, 7);
    this.sys.grect(0, 128-8, 192, 8, 7);
    
    for (var i = 0; i < 16; ++i) {
      this.sys.grect(0, 8+i*7, 192, 7, i);
      //this.sys.print(''+i, 96, 8+i*7, 7);
    }
  }

  onKeyDown(e) {
  }

  onMouseClick(e) {
  }

  onMouseWheel(e) {
  }

};
