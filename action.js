// Phosphor - a browser-based microcomputer
// Copyright (c) 2018 Marc Lepage

'use strict';

module.exports = class Action {

  constructor(redo, undo, merge) {
    this._redo = redo;
    this._undo = undo;
    this._merge = merge;
    this.clear();
  }

  canRedo() {
    return this._done < this._list.length;
  }

  canUndo() {
    return this._done > 0;
  }

  clear() {
    this._list = [];
    this._done = 0;
  }

  do(action) {
    this._redo(action);
    this._list.length = this._done;
    const merged = (this._done > 0 && this._merge) ? this._merge(this._list[this._done-1], action) : undefined;
    if (merged !== undefined)
      this._list[this._done-1] = merged;
    else
      this._list[this._done++] = action;
  }

  redo() {
    if (this._done < this._list.length)
      this._redo(this._list[this._done++]);
  }

  undo() {
    if (this._done > 0)
      this._undo(this._list[--this._done]);
  }

};
