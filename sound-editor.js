// Simple computer
// Marc Lepage Fall 2017

'use strict';

module.exports = class SoundEditor {

  // ---------------------------------------------------------------------------

  onDraw() {
    this.sys.gclear(13);
    this.sys.grect(20, 10, 40, 30, 11);
    this.sys.gchar('M', 100, 100, undefined, 15);
    this.sys.gpixel(20, 10, 14);
  }

  onKeyDown(e) {
  }

  onMouseClick(e) {
  }

  onMouseWheel(e) {
  }

};
