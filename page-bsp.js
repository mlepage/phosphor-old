// Simple computer
// Marc Lepage, Fall 2017

'use strict';

const bsp = require('./bsp.js');

const imgCharset = new Image();
imgCharset.onload = function() {
  const canvasCharset = document.createElement('canvas');
  canvasCharset.width = imgCharset.width;
  canvasCharset.height = imgCharset.height;
  canvasCharset.getContext('2d').drawImage(imgCharset, 0, 0, imgCharset.width, imgCharset.height);
  const dataCharset = canvasCharset.getContext('2d').getImageData(0, 0, imgCharset.width, imgCharset.height).data;
  const bgCharset = dataCharset[0] > 192;
  const crom = [];
  const cw = imgCharset.width/16, ch = imgCharset.height/6;
  crom[0] = 0; // space
  for (var i = 1; i <96; ++i) {
    var bmp = 0, j = 0;
    const x0 = (i%16)*cw-1; // adjust (this image has char in top left of cell)
    const xw = x0+cw;
    const y0 = Math.floor(i/16)*ch;
    const yh = y0+ch;
    for (var y = y0; y < yh; ++y)
      for (var x = x0; x < xw; ++x, ++j)
        if (dataCharset[(y*imgCharset.width+x)*4] > 192 != bgCharset) bmp |= (1<<j);
    crom[i] = bmp;
  }
  
  const micro = bsp.newMicro();
  micro.ctlCharacterRom(crom);
  micro.reboot();
}
imgCharset.src = './charset-5x7.png';
