// Phosphor - a browser-based microcomputer
// Copyright (c) 2017-2018 Marc Lepage

'use strict';

const luavm = require('./luavm.js');

const init = `
do
  local g = js.global
  local jsnull = js.null
  
  local concat = table.concat
  local yield = coroutine.yield
  
  local sys_char = g.__sys_char
  function char(...)
    sys_char(nil, ...)
  end
  
  local sys_circle = g.__sys_circle
  function circle(...)
    sys_circle(nil, ...)
  end
  
  local sys_clear = g.__sys_clear
  function clear(...)
    sys_clear(nil, ...)
  end
  
  local sys_key = g.__sys_key
  function key(...)
    return sys_key(nil, ...)
  end
  
  local sys_keyp = g.__sys_keyp
  function keyp(...)
    return sys_keyp(nil, ...)
  end
  
  local sys_keyr = g.__sys_keyr
  function keyr(...)
    return sys_keyr(nil, ...)
  end
  
  local sys_line = g.__sys_line
  function line(...)
    return sys_line(nil, ...)
  end
  
  log = print
  
  local sys_map = g.__sys_map
  function map(...)
    sys_map(nil, ...)
  end
  
  local sys_memcopy = g.__sys_memcopy
  function memcopy(...)
    sys_memcopy(nil, ...)
  end
  
  local sys_memread = g.__sys_memread
  function memread(...)
    return sys_memread(nil, ...)
  end
  
  local sys_memset = g.__sys_memset
  function memset(...)
    sys_memset(nil, ...)
  end
  
  local sys_memwrite = g.__sys_memwrite
  function memwrite(...)
    sys_memwrite(nil, ...)
  end
  
  local sys_mget = g.__sys_mget
  function mget(...)
    return sys_mget(nil, ...)
  end
  
  local sys_mset = g.__sys_mset
  function mset(...)
    sys_mset(nil, ...)
  end
  
  local sys_peek = g.__sys_peek
  function peek(...)
    return sys_peek(nil, ...)
  end
  
  local sys_pget = g.__sys_pget
  function pget(...)
    return sys_pget(nil, ...)
  end
  
  -- TODO not the best impl, handle table, etc.
  local sys_write = g.__sys_write
  function print(...)
    sys_write(nil, concat({...}, ' '), '\\n')
  end
  
  local sys_poke = g.__sys_poke
  function poke(...)
    sys_poke(nil, ...)
  end
  
  local sys_pset = g.__sys_pset
  function pset(...)
    sys_pset(nil, ...)
  end
  
  function read(...)
    yield()
    return g.__lua_read
  end
  
  local sys_rect = g.__sys_rect
  function rect(...)
    sys_rect(nil, ...)
  end
  
  local sys_sget = g.__sys_sget
  function sget(...)
    return sys_sget(nil, ...)
  end
  
  local sys_sprite = g.__sys_sprite
  function sprite(...)
    sys_sprite(nil, ...)
  end
  
  local sys_sset = g.__sys_sset
  function sset(...)
    sys_sset(nil, ...)
  end
  
  local sys_text = g.__sys_text
  function text(...)
    sys_text(nil, ...)
  end
  
  function write(...)
    sys_write(nil, ...)
  end
end`;

module.exports = class Lua {

  async main(...args) {
    const sys = this.sys;
    this.L = new luavm.Lua.State();
    window.__sys_char = sys.char.bind(sys);
    window.__sys_circle = sys.circle.bind(sys);
    window.__sys_clear = sys.clear.bind(sys);
    window.__sys_key = sys.key.bind(sys);
    window.__sys_keyp = sys.keyp.bind(sys);
    window.__sys_keyr = sys.keyr.bind(sys);
    window.__sys_line = sys.line.bind(sys);
    window.__sys_map = sys.map.bind(sys);
    window.__sys_memcopy = sys.memcopy.bind(sys);
    window.__sys_memread = sys.memread.bind(sys);
    window.__sys_memset = sys.memset.bind(sys);
    window.__sys_memwrite = sys.memwrite.bind(sys);
    window.__sys_mget = sys.mget.bind(sys);
    window.__sys_mset = sys.mset.bind(sys);
    window.__sys_peek = sys.peek.bind(sys);
    window.__sys_pget = sys.pget.bind(sys);
    window.__sys_poke = sys.poke.bind(sys);
    window.__sys_pset = sys.pset.bind(sys);
    window.__sys_rect = sys.rect.bind(sys);
    window.__sys_sget = sys.sget.bind(sys);
    window.__sys_sprite = sys.sprite.bind(sys);
    window.__sys_sset = sys.sset.bind(sys);
    window.__sys_text = sys.text.bind(sys);
    window.__sys_write = sys.write.bind(sys);
    this.L.execute(init);
    delete window.__sys_char;
    delete window.__sys_circle;
    delete window.__sys_clear;
    delete window.__sys_key;
    delete window.__sys_keyp;
    delete window.__sys_keyr;
    delete window.__sys_line;
    delete window.__sys_map;
    delete window.__sys_memcopy;
    delete window.__sys_memread;
    delete window.__sys_memset;
    delete window.__sys_memwrite;
    delete window.__sys_mget;
    delete window.__sys_mset;
    delete window.__sys_peek;
    delete window.__sys_pget;
    delete window.__sys_poke;
    delete window.__sys_pset;
    delete window.__sys_rect;
    delete window.__sys_sget;
    delete window.__sys_sprite;
    delete window.__sys_sset;
    delete window.__sys_text;
    delete window.__sys_write;
    
    // HACK to choose code to run
    var code = sys._os.filesystem[`phosphor:/${args[1]}`];
    if (!code)
      code = window.program_code;
    if (!code)
      return;
    
    this.L.execute(`co = coroutine.wrap(function() ${code} js.global.__lua_done = true js.global.__lua_draw = draw ~= nil js.global.__lua_update = update ~= nil end)`);
    
    while (true) {
      this.L.execute('co()');
      if (window.__lua_done) {
        delete window.__lua_done;
        if (window.__lua_draw) {
          this.onDraw = this._onDraw;
          delete window.__lua_draw;
        }
        if (window.__lua_update) {
          this.onUpdate = this._onUpdate;
          delete window.__lua_update;
        }
        break;
      }
      // TODO assuming read, need to pass on args
      window.__lua_read = await sys.read();
    }
  }

  // ---------------------------------------------------------------------------

  _onDraw() {
    this.L.execute('draw()');
    this.sys._os.bspScreenFlip(this.sys._os.mem); // TODO better place for this
  }

  _onUpdate() {
    this.L.execute('update()');
  }

};
