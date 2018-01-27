// Simple computer
// Marc Lepage Fall 2017

'use strict';

module.exports = class MapEditor {

  // ---------------------------------------------------------------------------

  onDraw() {
    this.sys.gclear(5);
    this.sys.grect(0, 0, 192, 8, 10);
    this.sys.grect(0, 128-8, 192, 8, 10);
  }

  onKeyDown(e) {
  }

  onMouseClick(e) {
  }

  onMouseWheel(e) {
  }

};
