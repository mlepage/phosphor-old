// Simple computer
// Marc Lepage Fall 2017

'use strict';

module.exports = class MapEditor {

  // ---------------------------------------------------------------------------

  onDraw() {
    this.sys.gclear(7);
    this.sys.grect(0, 0, 192, 7, 6);
    this.sys.grect(0, 128-7, 192, 7, 6);
    this.sys.gtext('MAP EDITOR (COMING SOON)', 0, 0, 15);
  }

  onKeyDown(e) {
  }

  onMouseClick(e) {
  }

  onMouseWheel(e) {
  }

};
