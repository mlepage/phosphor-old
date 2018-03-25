// Phosphor - a browser-based microcomputer
// Copyright (c) 2017-2018 Marc Lepage

'use strict';

module.exports = {

  clone(p) {
    return [p[0], p[1]];
  },

  // return <0 if a<b, 0 if a==b, >0 if a>b
  compare(a, b) {
    return a[0] == b[0] ? a[1] - b[1] : a[0] - b[0];
  },

  // return whether a in [start, end]
  contains(start, end, p) {
    return (start[0] < p[0] || start[0] == p[0] && start[1] <= p[1])
        && (p[0] < end[0] || p[0] == end[0] && p[1] < end[1]);
  },

  // ensure values are in order
  sort(a, b) {
    if (b[0] < a[0] || b[0] == a[0] && b[1] < a[1]) {
      var tmp = a[0]; a[0] = b[0]; b[0] = tmp;
      tmp = a[1]; a[1] = b[1]; b[1] = tmp;
    }
  },

  // swap the values
  swap(a, b) {
    var tmp = a[0]; a[0] = b[0]; b[0] = tmp;
    tmp = a[1]; a[1] = b[1]; b[1] = tmp;
  }

};
