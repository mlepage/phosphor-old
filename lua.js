// Simple computer
// Marc Lepage, Fall 2017

'use strict';

const luavm = require('./luavm.js');

const init = `
do
  local jsnull = js.null

  local concat = table.concat
  local yield = coroutine.yield
  
  local sys_clear = js.global.__sys_clear
  function clear(...)
    sys_clear(nil, ...)
  end
  
  local sys_gclear = js.global.__sys_gclear
  function gclear(...)
    sys_gclear(nil, ...)
  end
  
  local sys_grect = js.global.__sys_grect
  function grect(...)
    sys_grect(nil, ...)
  end
  
  local sys_key = js.global.__sys_key
  function key(...)
    return sys_key(nil, ...)
  end
  
  log = print
  
  --local sys_pal = js.global.__sys_pal
  --function pal(...)
  --  sys_pal(nil, ...)
  --end
  
  --local sys_pget = js.global.__sys_pget
  --function pget(...)
  --  sys_pget(nil, ...)
  --end
  
  -- TODO not the best impl, handle table, etc.
  local sys_write = js.global.__sys_write
  function print(...)
    sys_write(nil, concat({...}, ' '), '\\n')
  end

  --local sys_pset = js.global.__sys_pset
  --function pset(...)
  --  sys_pset(nil, ...)
  --end
  
  function read(...)
    yield()
    return js.global.__lua_read
  end
  
  local sys_rect = js.global.__sys_rect
  function rect(...)
    sys_grect(nil, ...)
  end
  
  local sys_sget = js.global.__sys_sget
  function sget(...)
    return sys_sget(nil, ...)
  end
  
  local sys_spr = js.global.__sys_spr
  function spr(...)
    sys_spr(nil, ...)
  end
  
  local sys_sset = js.global.__sys_sset
  function sset(...)
    sys_sset(nil, ...)
  end
  
  function write(...)
    sys_write(nil, ...)
  end
end`;

module.exports = class Lua {

  async main(...args) {
    this.L = new luavm.Lua.State();
    window.__sys_clear = this.sys.gclear.bind(this.sys);
    window.__sys_gclear = this.sys.gclear.bind(this.sys);
    window.__sys_grect = this.sys.grect.bind(this.sys);
    window.__sys_key = this.sys.key.bind(this.sys);
    //window.__sys_pal = this.sys.pal.bind(this.sys);
    //window.__sys_pget = this.sys.pget.bind(this.sys);
    //window.__sys_pset = this.sys.pset.bind(this.sys);
    window.__sys_rect = this.sys.grect.bind(this.sys);
    window.__sys_sget = this.sys.sget.bind(this.sys);
    window.__sys_spr = this.sys.spr.bind(this.sys);
    window.__sys_sset = this.sys.sset.bind(this.sys);
    window.__sys_write = this.sys.write.bind(this.sys);
    this.L.execute(init);
    delete window.__sys_clear;
    delete window.__sys_gclear;
    delete window.__sys_grect;
    delete window.__sys_key;
    //delete window.__sys_pal;
    //delete window.__sys_pget;
    //delete window.__sys_pset;
    delete window.__sys_rect;
    delete window.__sys_sget;
    delete window.__sys_spr;
    delete window.__sys_sset;
    delete window.__sys_write;
    
    // HACK to choose code to run
    var code = this.sys._os.filesystem[`mcomputer:/${args[1]}`];
    if (!code)
      code = this.sys._os.filesystem[`mcomputer:${window.loadedFile}`];
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
      window.__lua_read = await this.sys.read();
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
