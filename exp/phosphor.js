// Phosphor - a browser-based microcomputer
// Copyright (c) 2017-2018 Marc Lepage

'use strict';

const floor = Math.floor, random = Math.random;

const charset =
// Thick 8x8
//[0,0,0,0,0,0,0,0,0,16,40,68,124,68,68,0,0,120,68,120,68,68,120,0,0,56,68,64,64,68,56,0,0,120,68,68,68,68,120,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,68,108,84,68,68,68,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,68,108,84,68,68,68,0,0,68,100,84,76,68,68,0,0,56,68,68,68,68,56,0,0,120,68,68,120,64,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,4,60,68,60,0,0,0,104,84,84,68,68,0,0,0,88,100,68,68,68,0,0,0,120,68,68,68,120,64,0,0,60,68,68,68,60,4,0,0,92,96,64,64,64,0,0,0,60,64,56,4,120,0,0,16,124,16,16,16,12,0,0,0,0,0,0,0,0,0,0,0,56,4,60,68,60,0,0,64,120,68,68,68,120,0,0,0,56,68,64,68,56,0,0,4,60,68,68,68,60,0,0,0,56,68,124,64,60,0,0,12,16,124,16,16,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,60,102,110,118,102,60,0,0,8,24,56,24,24,60,0,0,60,70,12,24,48,126,0,0,60,6,28,6,70,60,0,0,4,12,28,44,126,12,0,0,126,64,124,6,70,60,0,0,60,96,124,102,102,60,0,0,126,6,12,24,24,24,0,0,60,102,60,102,102,60,0,0,60,102,102,62,6,60,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,60,102,102,126,102,0,0,124,102,124,102,102,124,0,0,60,98,96,96,98,60,0,0,124,102,102,102,102,124,0,0,126,96,120,96,96,126,0,0,126,96,120,96,96,96,0,0,60,98,96,110,102,60,0,0,102,102,126,102,102,102,0,0,60,24,24,24,24,60,0,0,60,12,12,12,76,56,0,0,102,108,120,120,108,102,0,0,96,96,96,96,96,126,0,0,99,119,127,107,99,99,0,0,102,118,126,110,102,102,0,0,60,102,102,102,102,60,0,0,124,102,102,124,96,96,0,0,60,102,102,102,108,54,0,0,124,102,102,124,102,102,0,0,62,96,60,6,6,124,0,0,126,24,24,24,24,24,0,0,102,102,102,102,102,60,0,0,102,102,102,102,60,24,0,0,99,99,107,62,54,54,0,0,102,60,24,24,60,102,0,0,102,102,60,24,24,24,0,0,126,12,24,48,96,126,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,60,6,62,102,62,0,0,96,96,124,102,102,124,0,0,0,60,96,96,96,60,0,0,6,6,62,102,102,62,0,0,0,60,102,126,96,60,0,0,14,24,62,24,24,24,0,0,0,62,102,102,62,6,60,0,96,96,124,102,102,102,0,0,24,0,56,24,24,12,0,0,12,0,28,12,12,12,120,0,96,102,108,120,108,102,0,0,56,24,24,24,24,14,0,0,0,106,127,107,107,99,0,0,0,108,118,102,102,102,0,0,0,60,102,102,102,60,0,0,0,124,102,102,124,96,96,0,0,62,102,102,62,6,6,0,0,110,112,96,96,96,0,0,0,62,96,60,6,124,0,0,48,126,48,48,48,28,0,0,0,102,102,102,102,62,0,0,0,102,102,102,60,24,0,0,0,99,107,107,62,54,0,0,0,102,60,24,60,102,0,0,0,102,102,102,62,12,120,0,0,126,12,24,48,126,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,]
// Thick 7x8
//[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,24,0,0,0,0,0,0,0,0,0,0,60,102,110,118,102,60,0,0,8,24,56,24,24,60,0,0,60,70,12,24,48,126,0,0,60,6,28,6,70,60,0,0,4,12,28,44,126,12,0,0,126,64,124,6,70,60,0,0,60,96,124,102,102,60,0,0,126,6,12,24,24,24,0,0,60,102,60,102,102,60,0,0,60,102,102,62,6,60,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,60,102,102,126,102,0,0,124,102,124,102,102,124,0,0,60,98,96,96,98,60,0,0,124,102,102,102,102,124,0,0,126,96,120,96,96,126,0,0,126,96,120,96,96,96,0,0,60,98,96,110,102,60,0,0,102,102,126,102,102,102,0,0,60,24,24,24,24,60,0,0,60,12,12,12,76,56,0,0,102,108,120,120,108,102,0,0,96,96,96,96,96,126,0,0,102,126,106,98,98,98,0,0,102,118,126,110,102,102,0,0,60,102,102,102,102,60,0,0,124,102,102,124,96,96,0,0,60,102,102,102,108,54,0,0,124,102,102,124,102,102,0,0,62,96,60,6,6,124,0,0,126,24,24,24,24,24,0,0,102,102,102,102,102,60,0,0,102,102,102,102,60,24,0,0,98,98,106,106,60,52,0,0,102,60,24,24,60,102,0,0,102,102,60,24,24,24,0,0,126,12,24,48,96,126,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,60,6,62,102,62,0,0,96,96,124,102,102,124,0,0,0,60,96,96,96,60,0,0,6,6,62,102,102,62,0,0,0,60,102,126,96,60,0,0,14,24,62,24,24,24,0,0,0,62,102,102,62,6,60,0,96,96,124,102,102,102,0,0,24,0,56,24,24,14,0,0,12,0,28,12,12,12,120,0,96,102,108,120,108,102,0,0,56,24,24,24,24,14,0,0,0,100,126,106,106,98,0,0,0,108,118,102,102,102,0,0,0,60,102,102,102,60,0,0,0,124,102,102,124,96,96,0,0,62,102,102,62,6,6,0,0,110,112,96,96,96,0,0,0,62,96,60,6,124,0,0,48,126,48,48,48,28,0,0,0,102,102,102,102,62,0,0,0,102,102,102,60,24,0,0,0,98,106,106,62,52,0,0,0,102,60,24,60,102,0,0,0,102,102,102,62,12,120,0,0,126,12,24,48,126,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,]
// Thin 6x8
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,16,16,16,0,16,0,0,40,40,0,0,0,0,0,0,40,124,40,40,124,40,0,0,16,60,80,56,20,120,16,0,0,68,8,16,32,68,0,0,32,80,32,84,72,52,0,0,16,16,0,0,0,0,0,0,8,16,16,16,16,16,8,0,32,16,16,16,16,16,32,0,16,84,56,84,16,0,0,0,0,16,16,124,16,16,0,0,0,0,0,0,0,16,32,0,0,0,0,56,0,0,0,0,0,0,0,0,0,16,0,0,0,4,8,16,32,64,0,0,56,76,84,100,68,56,0,0,16,48,16,16,16,56,0,0,56,68,8,16,32,124,0,0,56,68,24,4,68,56,0,0,8,24,40,124,8,8,0,0,124,64,120,4,68,56,0,0,56,64,120,68,68,56,0,0,124,4,8,8,16,16,0,0,56,68,56,68,68,56,0,0,56,68,68,60,4,56,0,0,0,0,16,0,0,16,0,0,0,0,16,0,0,16,32,0,0,8,16,32,16,8,0,0,0,0,124,0,124,0,0,0,0,32,16,8,16,32,0,0,56,68,8,16,0,16,0,0,56,76,84,88,64,56,0,0,56,68,68,124,68,68,0,0,120,68,120,68,68,120,0,0,56,68,64,64,68,56,0,0,120,68,68,68,68,120,0,0,124,64,120,64,64,124,0,0,124,64,120,64,64,64,0,0,56,68,64,76,68,56,0,0,68,68,124,68,68,68,0,0,124,16,16,16,16,124,0,0,60,4,4,4,68,56,0,0,68,72,80,112,72,68,0,0,64,64,64,64,64,124,0,0,68,108,84,84,68,68,0,0,68,100,84,76,68,68,0,0,56,68,68,68,68,56,0,0,120,68,68,120,64,64,0,0,56,68,68,68,72,52,0,0,120,68,68,120,68,68,0,0,60,64,56,4,4,120,0,0,124,16,16,16,16,16,0,0,68,68,68,68,68,56,0,0,68,68,40,40,16,16,0,0,68,84,84,40,40,40,0,0,68,40,16,16,40,68,0,0,68,68,40,16,16,16,0,0,124,8,16,32,64,124,0,0,24,16,16,16,16,16,24,0,0,64,32,16,8,4,0,0,48,16,16,16,16,16,48,0,16,40,0,0,0,0,0,0,0,0,0,0,0,0,124,0,32,16,0,0,0,0,0,0,0,56,4,60,68,60,0,0,64,88,100,68,68,120,0,0,0,56,64,64,68,56,0,0,4,60,68,68,76,52,0,0,0,56,68,124,64,56,0,0,28,32,124,32,32,32,0,0,0,60,68,76,52,4,120,0,64,88,100,68,68,68,0,0,16,0,112,16,16,124,0,0,8,0,56,8,8,8,112,0,64,68,72,112,72,68,0,0,112,16,16,16,16,124,0,0,0,104,84,84,84,68,0,0,0,88,100,68,68,68,0,0,0,56,68,68,68,56,0,0,0,88,100,68,68,120,64,0,0,60,68,68,76,52,4,0,0,88,100,64,64,64,0,0,0,60,64,56,4,120,0,0,16,124,16,16,16,12,0,0,0,68,68,68,76,52,0,0,0,68,68,40,40,16,0,0,0,68,84,84,40,40,0,0,0,68,40,16,40,68,0,0,0,68,68,76,52,4,120,0,0,124,8,16,32,124,0,0,8,16,16,32,16,16,8,0,16,16,16,16,16,16,0,0,32,16,16,8,16,16,32,0,0,0,32,84,8,0,0,0,0,0,0,0,0,0,0,]

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
  uniform sampler2D u_texture;
  varying vec2 v_texcoord;
  
  void main() {
    /*
    float v = v_texcoord.y*160.0;
    if (fract(v) < 0.25) {
      gl_FragColor = vec4(0.125, 0.125, 0.125, 1);
      return;
    }
    */
    
    float p = mod(texture2D(u_texture, v_texcoord).r*255.0, 64.0);
    
    //float b = floor(p/16.0);
    //p -= b*16.0;
    //float g = floor(p/4.0);
    //p -= g*4.0;
    //float r = p;
    
    float b = mod(p, 4.0);
    p -= b; p /= 4.0;
    float g = mod(p, 4.0);
    p -= g; p /= 4.0;
    float r = p;
    
    //gl_FragColor = vec4(r/3.0, 0, 0, 1);
    //gl_FragColor = vec4(0, g/3.0, 0, 1);
    //gl_FragColor = vec4(0, 0, b/3.0, 1);
    gl_FragColor = vec4(r/3.0, g/3.0, b/3.0, 1);

    // muted
    //gl_FragColor = vec4((1.0+2.0*r)/8.0, (1.0+2.0*g)/8.0, (1.0+2.0*b)/8.0, 1);
  }
`;

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

module.exports = class Phosphor {

  constructor(canvas) {
    const mem = new Uint8Array(0x20000); // 128K
    
    const file_table = []; // contains fcbs
    let next_fid = 1;
    
    const process_table = []; // contains pcbs
    let next_pid = 1;
    
    const vc_table = []; // contains pcbs
    
    const system = process_table[0] = {
      _: {
        pid: 0,
        ppid: 0,
        process: this,
        fd_table: []
      }
    };
    
    let current = null; // current pcb (can be null)
    let interval = null; // used for update (can be null)
    
    const SPECIAL = {}; // privileged cookie
    
    // -----------------------
    
    // TODO for now load charset here
    for (let i = 0; i < charset.length; ++i) {
      mem[0x9600+i] = charset[i];
    }
    
    // -----------------------
    
    let scale = 3; // TODO scale must change
    
    const spe = {};
    
    function shadowPointerEvent(e) {
      const rect = e.target.getBoundingClientRect();
      spe.x = floor((e.clientX - rect.left) / scale);
      spe.y = floor((e.clientY - rect.top) / scale);
      return spe;
    }

    // -----------------------
    
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
    
    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(gl.getUniformLocation(program, 'u_texture'), 0);
    
    canvas.style.outline = 'none'; // no focus outline
    canvas.setAttribute('tabindex', '0'); // allow focus
    canvas.focus();
    
    let frames = 0;
    let framesNow = performance.now();
    let updates = 0;
    let updatesNow = performance.now();
    
    const draw = () => {
      const process = current && current._.process;
      if (process && process.draw) {
        process.draw();
      } else {
        for (let i = 0; i < 38400; ++i) {
          mem[i] = floor(random()*64);
        }
      }
      
      gl.texImage2D(gl.TEXTURE_2D, texture, gl.LUMINANCE, 240, 160, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, mem);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      
      ++frames;
      const now = performance.now();
      if (framesNow + 1000 <= now) {
        console.log('fps: ' + frames);
        frames = 0;
        framesNow = now;
      }
    }
    
    const update = () => {
      const process = current && current._.process;
      if (process && process.update) {
        process.update();
      }
      
      ++updates;
      const now = performance.now();
      if (updatesNow + 1000 <= now) {
        console.log('ups: ' + updates);
        updates = 0;
        updatesNow = now;
      }
      
      requestAnimationFrame(draw);
    };
    
    canvas.addEventListener('focus', (e) => {
      console.log('focus', e);
    });
    
    canvas.addEventListener('keydown', (e) => {
      if (e.key == 'Escape') {
        console.log('process_table', process_table);
        console.log('file_table', file_table);
        return;
      } else if (e.key == '`') {
        system.vc(0);
        return;
      } else if (e.key == '0') {
        system.vc(10);
        return;
      } else if (e.key == '1' || e.key == '2' || e.key == '3' || e.key == '4' || e.key == '5') {
        system.vc(Number(e.key));
        return;
      } else if (e.key == '~') {
        system.ps();
      }
      const process = current && current._.process;
      if (process && process.onKeyDown) {
        process.onKeyDown(e);
        requestAnimationFrame(draw);
      }
    });
    
    canvas.addEventListener('pointerdown', (e) => {
      const process = current && current._.process;
      if (process && process.onPointerDown) {
        process.onPointerDown(shadowPointerEvent(e));
        requestAnimationFrame(draw);
      }
    });
    
    //canvas.addEventListener('pointermove', (e) => {
    //  console.log('pointermove', e);
    //});
    
    canvas.addEventListener('pointerup', (e) => {
      const process = current && current._.process;
      if (process && process.onPointerUp) {
        process.onPointerUp(shadowPointerEvent(e));
        requestAnimationFrame(draw);
      }
    });
    
    canvas.addEventListener('resize', (e) => {
      console.log('resize', e);
    });
    
    system.boot = function() {
      console.log('booting...');
      system.vc(0);
    };
    
    system.box = function(x, y, w, h, c) {
      for (let i = y; i < y+h; ++i) {
        mem.fill(c, i*240+x, i*240+x+w);
      }
    };
    
    system.char = function(ch, x, y, c1, c2) {
      if (c1 == undefined) c1 = 42; // temp
      if (c2 == undefined) c2 = 21; // temp
      let a = 0x9600 + ch*8;
      for (let i = 0; i < 8; ++i) {
        const b = mem[a++];
        for (let j = 0; j < 6; ++j) {
          mem[(y+i)*240+(x+j)] = ((b&(0x80>>j))!=0) ? c1 : c2;
        }
      }
    };
    
    system.clear = function(c) {
      if (c == undefined)
        c = 0;
      mem.fill(c, 0, 0x9600);
    };
    
    system.close = function() {
      // TODO close file (handle)
    };
    
    system.open = function(...args) {
      if (args[0] == SPECIAL) {
        const fcb = {
          file: args[1],
          async read() {
            return this.file.read(...args);
          },
          write(...args) {
            this.file.write(...args);
            // TODO redraw? only if terminal is in active vc?
            requestAnimationFrame(draw);
          }
        };
        file_table.push(fcb);
        return this._.fd_table.push(fcb) - 1;
      }
    };
    
    system.peek = function(addr) {
      return mem[addr];
    };
    
    system.ps = function() {
      console.log('process list', process_table);
    };
    
    system.poke = function(addr, val) {
      // TODO checking
      mem[addr] = val;
    };
    
    system.read = async function(...args) {
      const stdin = this._.fd_table[0];
      return stdin.read(...args);
    };
    
    // TODO implement this sensibly
    system.rect = function(x, y, w, h, c1, c2) {
      if (c1 != undefined) {
        this.box(x, y, w, h, c1);
      }
      if (c2 != undefined) {
        this.box(x, y, w, 1, c2);
        this.box(x, y, 1, h, c2);
        this.box(x+w-1, y, 1, h, c2);
        this.box(x, y+h-1, w, 1, c2);
      }
    };
    
    system.seek = function() {
      // TODO seek (file handle)
    };
    
    system.spawn = function(...args) {
      console.log('spawn', args);
      const name = args[0];
      const M = require(`./${name}.js`); // TODO does require memoize?
      const process = new M();
      const pid = next_pid++;
      const pcb = Object.create(this);
      pcb._ = {
        pid: pid,
        ppid: this._.pid,
        process: process,
        fd_table: []
      };
      process_table[pid] = pcb;
      process.P = pcb;
      if (name == 'terminal') {
        // Special case: use self as file descriptors
        pcb.open(SPECIAL, process); // stdin
        pcb.open(SPECIAL, process); // stdout
        pcb.open(SPECIAL, process); // stderr
      } else {
        // Copy file descriptors of parent
        pcb._.fd_table = this._.fd_table.slice();
      }
      if (process.main) {
        process.main(...args);
      }
      return pcb;
    };
    
    system.text = function(str, x, y, c1, c2) {
      if (c1 == undefined) c1 = 42; // temp
      if (c2 == undefined) c2 = 21; // temp
      const W = 6;
      for (let idx = 0; idx != str.length; ++idx, x+=W) {
        let a = 0x9600 + str.charCodeAt(idx)*8;
        for (let i = 0; i < 8; ++i) {
          const b = mem[a++];
          for (let j = 0; j < W; ++j) {
            mem[(y+i)*240+(x+j)] = ((b&(0x80>>j))!=0) ? c1 : c2;
          }
        }
      }
    };
    
    system.vc = function(id) {
      console.log('vc', id);
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      if (!vc_table[id]) {
        switch (id) {
          case 0:
            vc_table[id] = system.spawn('terminal', 'login');
            break;
          case 1:
            vc_table[id] = system.spawn('code-editor');
            break;
          case 2:
            vc_table[id] = system.spawn('sprite-editor');
            break;
          case 3:
            vc_table[id] = system.spawn('palette');
            break;
          case 4:
            vc_table[id] = system.spawn('prog2');
            break;
          case 5:
            vc_table[id] = system.spawn('proggy');
            break;
          case 6:
            vc_table[id] = system.spawn('char-editor');
            break;
          case 10:
            vc_table[id] = system.spawn('terminal');
            break;
        }
      }
      current = vc_table[id];
      if (current._.process.update) {
        interval = setInterval(update, 1000/58);
      } else {
        requestAnimationFrame(draw);
      }
    };
    
    system.write = function(...args) {
      const stdout = this._.fd_table[1];
      stdout.write(...args);
      // TODO what should write return?
    };
    
    system.boot();
  }

};
