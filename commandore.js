var handlers = {};
var commandStore = {};

var DEBUG = (typeof process !== 'undefined' && process.env && process.env.NODE_ENV == 'development');

var KEY = "__commandore_stored_commands";

var debug;
if (!DEBUG || typeof console === 'undefined' || typeof console.log === 'undefined') {
  debug = Function.prototype
}
else if (typeof console.log === 'object') {
  // WTF ie8
  debug = console.log
}
else {
  debug = function debug() {
    console.log.apply(console, arguments)
  }
}

function popPrevSessionId() {
  var id = sessionStorage.getItem("__commandore_previous_session_id") || null;
  sessionStorage.removeItem("__commandore_previous_session_id");
  return id;
}
function newSessionId() {
  var id = String((new Date().getTime()));
  sessionStorage.setItem("__commandore_previous_session_id", id);
  return id;
}

var prevSessionId = popPrevSessionId();
var currentSessionId = newSessionId();

function sessionId() {
  return currentSessionId;
}
function previousSessionId() {
  return prevSessionId;
}

// Current db (for this session)
var DB = {};

// Stored db (from last session)
var storedDB = null;

function setHandler(commandName, handler) {
  handlers[commandName] = handler  
}

function commit() {
  sessionStorage.setItem(KEY,  JSON.stringify(DB))  
}

function remove(name) {
  debug("Removing command "+name)
  delete DB[name];
  commit();
}

function store(name, data) {
  debug("storing ", {id: sessionId(), name: name, data: data});
  DB[name] = {id: sessionId(), name: name, data: data};
  commit();
  return function runStoredCommand() {
    var res = execute(name, data);
    remove(name);
    return res;
  };
}

function execute(name, data) {
  var handler = handlers[name];
  if (!handler) {
    debug("WARNING: No handler registered for command of type "+name);
    return;
  }
  remove(name);
  return handler(data);
}

// Resume commands from previous session
function resume() {
  storedDB || (storedDB = restore());
  console.log(storedDB)
  if (!storedDB) return;
  debug("Found stored command db:", storedDB)
  var key, command;
  for (key in storedDB) if (storedDB.hasOwnProperty(key)) {
    command = storedDB[key];
    debug(command.id, prevSessionId)
    if (command.id !== prevSessionId) continue;
    execute(key, command.data);
  }
}

function restore() {
  var item = sessionStorage.getItem(KEY);
  if (!item) {
    debug("No stored items found");
    return null;
  }
  sessionStorage.removeItem(KEY);
  return JSON.parse(item);
}

module.exports = {
  setHandler: setHandler,
  store: store,
  remove: remove,
  resume: resume,
  currentSessionId: sessionId,
  previousSessionId: previousSessionId
};