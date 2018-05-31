// Phosphor - a browser-based microcomputer
// Copyright (c) 2017-2018 Marc Lepage

'use strict';

const Phosphor = require('./phosphor.js');

const round = Math.round;

const wheelName = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

const compatWhichToButtons = [ 0, 1, 4, 2 ];

// TODO get palette from micro
const palette = [ // Dawnbringer
  '#140c1c', '#442434', '#30346d', '#4e4a4e',
  '#854c30', '#346524', '#d04648', '#757161',
  '#597dce', '#d27d2c', '#8595a1', '#6daa2c',
  '#d2aa99', '#6dc2ca', '#dad45e', '#deeed6',
];
const palette255 = [
  [0x14,0x0c,0x1c], [0x44,0x24,0x34], [0x30,0x34,0x6d], [0x4e,0x4a,0x4e],
  [0x85,0x4c,0x30], [0x34,0x65,0x24], [0xd0,0x46,0x48], [0x75,0x71,0x61],
  [0x59,0x7d,0xce], [0xd2,0x7d,0x2c], [0x85,0x95,0xa1], [0x6d,0xaa,0x2c],
  [0xd2,0xaa,0x99], [0x6d,0xc2,0xca], [0xda,0xd4,0x5e], [0xde,0xee,0xd6],
];
const palette255flat = [
  0x14,0x0c,0x1c,0x44,0x24,0x34,0x30,0x34,0x6d,0x4e,0x4a,0x4e,
  0x85,0x4c,0x30,0x34,0x65,0x24,0xd0,0x46,0x48,0x75,0x71,0x61,
  0x59,0x7d,0xce,0xd2,0x7d,0x2c,0x85,0x95,0xa1,0x6d,0xaa,0x2c,
  0xd2,0xaa,0x99,0x6d,0xc2,0xca,0xda,0xd4,0x5e,0xde,0xee,0xd6,
];

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    return shader;
  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (gl.getProgramParameter(program, gl.LINK_STATUS))
    return program;
  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

const vertexShaderSrc = `
  attribute vec4 a_position;
  attribute vec2 a_texcoord;
  
  varying vec2 v_texcoord;

  void main() {
    gl_Position = vec4(a_position.xy, 0, 1);
    v_texcoord = a_texcoord;
  }
`;

const fragmentShaderSrc = `
  precision mediump float;
  
  varying vec2 v_texcoord;
  
  uniform sampler2D u_texture;
  uniform sampler2D u_palette;
  
  void main() {
    float index = texture2D(u_texture, v_texcoord).r;
    gl_FragColor = texture2D(u_palette, vec2(index, 0));
  }
`;

// https://stackoverflow.com/questions/879152/how-do-i-make-javascript-beep
const snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");

function audioBeep() {
  snd.play();
}

function fileExport(name, text) {
  const anchor = document.createElement('a');
  anchor.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  anchor.setAttribute('download', name);
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

function fileImport() {
  const input = document.querySelector('input');
  //const input = document.createElement('input');
  input.style.display = 'none';
  input.addEventListener('change', () => {
    const reader = new FileReader();
    reader.onload = event => {
      console.log(event.target);
      this.onFileImport(input.files[0].name, event.target.result);
    };
    reader.readAsText(event.target.files[0]);
  }, {once:true});
  //document.body.appendChild(input);
  input.click();
  //document.body.removeChild(input);
}

function fsImport() {
  const input = document.querySelector('input');
  //const input = document.createElement('input');
  input.style.display = 'none';
  input.addEventListener('change', () => {
    const reader = new FileReader();
    reader.onload = event => {
      console.log(event.target);
      this.onFsImport(input.files[0].name, event.target.result);
    };
    reader.readAsText(event.target.files[0]);
  }, {once:true});
  //document.body.appendChild(input);
  input.click();
  //document.body.removeChild(input);
}

function pointerDown(e) {
  const rect = e.target.getBoundingClientRect();
  const x = round((e.clientX - rect.left) / this.bsp_scale);
  const y = round((e.clientY - rect.top) / this.bsp_scale);
  const es = this.bsp_ePointer;
  es.screenX = es.x = x;
  es.screenY = es.y = y;
  es.buttons = (e.buttons !== undefined) ? e.buttons : compatWhichToButtons[e.which];
  this.onPointerDown(es);
  e.preventDefault();
}

function pointerMove(e) {
  const rect = e.target.getBoundingClientRect();
  const x = round((e.clientX - rect.left) / this.bsp_scale);
  const y = round((e.clientY - rect.top) / this.bsp_scale);
  const es = this.bsp_ePointer;
  es.screenX = es.x = x;
  es.screenY = es.y = y;
  es.buttons = (e.buttons !== undefined) ? e.buttons : compatWhichToButtons[e.which];
  this.onPointerMove(es);
  e.preventDefault();
}

function pointerUp(e) {
  const rect = e.target.getBoundingClientRect();
  const x = round((e.clientX - rect.left) / this.bsp_scale);
  const y = round((e.clientY - rect.top) / this.bsp_scale);
  const es = this.bsp_ePointer;
  es.screenX = es.x = x;
  es.screenY = es.y = y;
  es.buttons = (e.buttons !== undefined) ? e.buttons : compatWhichToButtons[e.which];
  this.onPointerUp(es);
  e.preventDefault();
}

function screenScale(scale) {
  const fullscreen = scale == 0;
  if (fullscreen) {
    if (this.bsp_fullscreen)
      return;
    let w = window.innerWidth;
    let h = window.innerHeight;
    let r = w/h;
    scale = (r <= 1.5) ? w/192: h/128;
    this.bsp_fullscreen = this.bsp_scale;
  } else {
    delete this.bsp_fullscreen;
    if (this.bsp_scale == scale)
      return;
  }
  this.bsp_scale = scale;
  this.bsp_canvas.width = scale*192;
  this.bsp_canvas.height = scale*128;
  this.bsp_gl.viewport(0, 0, scale*192, scale*128);
  console.log('scale:', scale, this.bsp_canvas.width, this.bsp_canvas.height, fullscreen)
  if (fullscreen) {
    this.bsp_canvas.style.position = 'fixed';
    this.bsp_canvas.style.left = (window.innerWidth-this.bsp_canvas.width)/2 + 'px';
    this.bsp_canvas.style.top = (window.innerHeight-this.bsp_canvas.height)/2 + 'px';
  } else {
    this.bsp_canvas.style.position = 'static';
  }
  this.onDraw();
}

function touchCancel(e) {
  e.preventDefault();
}

function touchEnd(e) {
  e.preventDefault();
  const rect = e.target.getBoundingClientRect();
  const e2 = this.bsp_eTouch = this.bsp_eTouch || { buttons: 1 };
  e2.x = round((e.changedTouches[0].clientX - rect.left) / this.bsp_scale);
  e2.y = round((e.changedTouches[0].clientY - rect.top) / this.bsp_scale);
  this.onPointerUp(e2);
}

function touchMove(e) {
  e.preventDefault();
  const rect = e.target.getBoundingClientRect();
  const e2 = this.bsp_eTouch = this.bsp_eTouch || { buttons: 1 };
  e2.x = round((e.touches[0].clientX - rect.left) / this.bsp_scale);
  e2.y = round((e.touches[0].clientY - rect.top) / this.bsp_scale);
  this.onPointerMove(e2);
}

function touchStart(e) {
  e.preventDefault();
  const rect = e.target.getBoundingClientRect();
  const e2 = this.bsp_eTouch = this.bsp_eTouch || {};
  e2.x = round((e.touches[0].clientX - rect.left) / this.bsp_scale);
  e2.y = round((e.touches[0].clientY - rect.top) / this.bsp_scale);
  this.onPointerDown(e2);
}

function wheel(e) {
  e.preventDefault();
  const rect = e.target.getBoundingClientRect();
  const e2 = this.bsp_eWheel = this.bsp_eWheel || {};
  e2.x = round((e.clientX - rect.left) / this.bsp_scale),
  e2.y = round((e.clientY - rect.top) / this.bsp_scale),
  e2.deltaX = e.deltaX / this.bsp_scale,
  e2.deltaY =  e.deltaY / this.bsp_scale,
  this.onWheel(e2);
}

module.exports = {

  newPhosphor() {
    const micro = new Phosphor();
    
    const canvas = document.createElement('canvas');
    const scale = 4; // TODO get scale from micro
    canvas.webkitBackingStorePixelRatio = 1;
    canvas.width = scale*192; // TODO get size from micro
    canvas.height = scale*128;
    canvas.setAttribute('tabindex', '0'); // allow focus
    canvas.style.outline = 'none'; // no focus outline
    
    document.body.insertBefore(canvas, document.body.childNodes[0]);
    canvas.focus();
    
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSrc);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSrc);
    const program = createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);
    
    const positions = [
      -1, 1, // top left
      1, -1, // bottom right
      1, 1, // top right
      -1, 1, // top left
      -1, -1, // bottom left
      1, -1 // bottom right
    ];
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    
    const texcoords = [
      0, 0, // top left
      1, 1, // bottom right
      1, 0, // top right
      0, 0, // top left
      0, 1, // bottom left
      1, 1 // bottom right
    ];
    const texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);
    
    const texcoordLocation = gl.getAttribLocation(program, 'a_texcoord');
    gl.enableVertexAttribArray(texcoordLocation);
    gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);
    
    const palette = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, palette);
    gl.texImage2D(gl.TEXTURE_2D, palette, gl.RGB, 16, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array(palette255flat));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(gl.getUniformLocation(program, 'u_palette'), 1);
    
    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(gl.getUniformLocation(program, 'u_texture'), 0);
    
    micro.bsp_canvas = canvas;
    micro.bsp_gl = gl;
    micro.bsp_texture = texture;
    micro.bsp_scale = scale; // TODO get scale from micro
    
    // shadow events
    micro.bsp_ePointer = { screenX: 0, screenY: 0, x: 0, y: 0, buttons: 0 };
    
    const bsp_vram = new Uint8Array(192*128);
    
    micro.bspScreenFlip = (vram) => {
      for (let i = 0, j = 0; i < 0x3000; ++i) {
        const byte = vram[i];
        bsp_vram[j++] = (byte&0xf)<<4;
        bsp_vram[j++] = byte&0xf0;
      }
      gl.texImage2D(gl.TEXTURE_2D, texture, gl.LUMINANCE, 192, 128, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, bsp_vram);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    
    micro.bspAudioBeep = audioBeep;
    micro.bspExport = fileExport;
    micro.bspImport = fileImport;
    micro.bspImportFs = fsImport;
    micro.bspScreenScale = screenScale;
    
    document.addEventListener('copy', micro.onCopy.bind(micro));
    document.addEventListener('cut', micro.onCut.bind(micro));
    document.addEventListener('paste', micro.onPaste.bind(micro));
    
    // for testing click
    //canvas.addEventListener('click', (e) => {console.log('click', e)});
    
    canvas.addEventListener('keydown', micro.onKeyDown.bind(micro));
    canvas.addEventListener('keyup', micro.onKeyUp.bind(micro));
    if (window.PointerEvent) {
      console.log('using pointer events');
      canvas.addEventListener('pointerdown', pointerDown.bind(micro));
      canvas.addEventListener('pointermove', pointerMove.bind(micro));
      canvas.addEventListener('pointerup', pointerUp.bind(micro));
    } else {
      console.log('using mouse events');
      canvas.addEventListener('mousedown', pointerDown.bind(micro));
      canvas.addEventListener('mousemove', pointerMove.bind(micro));
      canvas.addEventListener('mouseup', pointerUp.bind(micro));
    }
    canvas.addEventListener('touchstart', touchStart.bind(micro));
    canvas.addEventListener('touchmove', touchMove.bind(micro));
    canvas.addEventListener('touchend', touchEnd.bind(micro));
    canvas.addEventListener('touchcancel', touchCancel.bind(micro));
    console.log('using wheel event:', wheelName);
    canvas.addEventListener(wheelName, wheel.bind(micro));
    
    canvas.onblur = () => { canvas.focus(); } // keep focus
    
    return micro;
  }

};