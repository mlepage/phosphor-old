// Simple computer
// Marc Lepage Fall 2017

'use strict';

module.exports = class MusicEditor {

  // ---------------------------------------------------------------------------

  onDraw() {
    this.sys.gclear(7);
    this.sys.grect(0, 0, 192, 7, 6);
    this.sys.grect(0, 128-7, 192, 7, 6);
    this.sys.gtext('MUSIC EDITOR (COMING SOON)', 0, 0, 15);
  }

  onKeyDown(e) {
  }

  onMouseClick(e) {
  }

  onMouseWheel(e) {
  }

};
