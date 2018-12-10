// Phosphor - a browser-based microcomputer
// Copyright (c) 2017-2018 Marc Lepage

'use strict';

const luavm = require('./luavm.js');

const init =
`do
  local P = js.global.__P
  local null = js.null
  js = nil

  local concat = table.concat
  local error = error
  local floor = math.floor
  local format = string.format
  local tonumber = tonumber
  local yield = coroutine.yield

  local P_open = P.open
  local P_seek = P.seek
  local P_write = P.write

  -- TODO Lua 5.3 use math.tointeger
  local function tointeger(x)
    local n = tonumber(x)
    return n and ((floor(n) == n) and n or nil)
  end

  local function argerror(f, n, e)
    error(format("bad argument #%d to '%s' (%s)", n, f, e), 3)
  end

  log = print
  function print(...)
    P_write(nil, 0, concat({...}, ' '), '\\n')
  end

  -- TODO file objects should ideally be userdata not table
  local file = {}
  file.__metatable = true
  file.__index = file
  local fd_table = {}

  function file:close()
    log('file:close', fd_table[self])
    -- TODO need to properly close file
  end

  function file:flush()
  end

  function file:lines()
  end

  function file:read(...)
    log('file:read', ...)
    local r = yield(fd_table[self], ...)
    if r == null then
      r = nil
    end
    return r
    -- TODO handle multiple return, errors
  end

  function file:seek(whence, offset)
    log('file:seek', whence, offset)
    if whence == nil then
      whence = 'cur'
    elseif not (whence == 'set' or whence == 'cur' or whence == 'end') then
      argerror('seek', 1, 'invalid option')
    end
    if offset == nil then
      offset = 0
    else
      offset = tointeger(offset)
      if not offset then
        argerror('seek', 2, 'integer expected')
      end
    end
    local r = P_seek(nil, fd_table[self], offset, whence)
    if r == -1 then
      return nil, 'error'
    end
    return r
  end

  function file:setvbuf(mode, size)
  end

  function file:write(...)
    log('file:write', ...)
    -- TODO check args must be string or number
    local r = P_write(nil, fd_table[self], ...)
    if r == -1 then
      return nil, 'error'
    end
    return self
  end

  io = {}
  local io = io

  function io.close(file)
    if file == nil then
      file = io.stdout
    end
    file:close()
  end

  function io.flush()
  end

  function io.input(file)
    if type(file) == 'string' then
      io.stdin = io.open(file, 'r')
    elseif fd_table[file] then
      io.stdin = file
    end
    return io.stdin
  end

  --function io.lines()
  --end

  function io.open(...)
    local fd = P_open(nil, ...)
    if fd == -1 then
      return nil, 'error'
    end
    local f = setmetatable({}, file)
    fd_table[f] = fd
    return f
  end

  function io.output(file)
    if type(file) == 'string' then
      io.stdout = io.open(file, 'w')
    elseif fd_table[file] then
      io.stdout = file
    end
    return io.stdout
  end

  --function io.popen(prog, mode)
  --end

  function io.read(...)
    return io.stdin:read(...)
  end

  --function io.tmpfile()
  --end

  function io.type(obj)
    -- TODO handle closed files (should return "closed file")
    return fd_table[obj] and file
  end

  function io.write(...)
    return io.stdout:write(...)
  end

  io.stdin = {}
  io.stdout = {}
  io.stderr = {}
  fd_table[io.stdin] = 0
  fd_table[io.stdout] = 1
  fd_table[io.stderr] = 2
end`;

function initState(L, P) {
  // TODO should probably write this using C API or use registry or args or something
  window.__P = {
    open: P.open.bind(P),
    seek: P.seek.bind(P),
    write: P.write.bind(P),
  };

  L.execute(init);

  delete window.__P;
}

module.exports = class Lua {

  async main(...args) {
    args.shift();

    const L = new luavm.Lua.State();
    const P = this.P;
    initState(L, P);

    const code = `f=io.open((...), 'r+')
      --f:seek('cur', 10)
      --f:write('QWERTY')
      --f:seek('set', 0)
      while true do
        a=f:read('l')
        if a == nil then break end
        print(a)
      end`;

    try {
      L.execute(`__co = coroutine.create(...)`, L.load(code));
    } catch (e) {
      P.write(1, e.message.match(/^\[string ".*"\]:(\d+: .*)$/)[1], '\n');
      return;
    }

    while (true) {
      const r = L.execute(`
        local r = { '', coroutine.resume(__co, ...) }
        r[1] = coroutine.status(__co)
        return unpack(r)`, ...args);
      const status = r.shift();
      const result = r.shift();
      if (status == 'suspended') {
        // read
        args.length = 0;
        args[0] = await P.read(...r); // TODO multiple return
      } else if (status == 'dead') {
        // finished or error
        if (result == false) {
          // error
          P.write(1, r[0].match(/^\[string ".*"\]:(\d+: .*)$/)[1], '\n');
        }
        break;
      }
    }
  }

};