var path  = require('path'),
    spawn = require('win-spawn'),
    fs    = require('fs'),
    log   = require('custom-logger').config({ format: "[%timestamp%] [run-command] %event% ->%message%" });

var basedir = path.join(process.env.PWD, "node_modules", ".bin");
var cmdStack = [];

var die = function(command) {
  i = cmdStack.indexOf(command);
  cmdStack.splice(i, 1);

  for (var i = 0; i < cmdStack.length; i++) {
    cmdStack[i].kill();
  }
}

function strip(string) {
  return string.replace(/(\r\n|\n|\r)/gm,"");
}

var cs = {
  settings: {
    info: true,
    warning: true,
    error: true
  },
  info    : function(msg) {
    if (this.settings.info) { log.info(strip(msg)); }
  },
  warning : function(msg) {
    if (this.settings.warning) { log.warning(strip(msg)); }
  },
  error   : function(msg) {
    if (this.settings.error) { log.error(strip(msg)); }
  }
}

var cmd = {
  run: function(obj) {
    var commandArray = obj[0].split(" "),
        command      = commandArray.shift(),
        commandArgs  = commandArray,
        callback     = obj[1];

    var localBinary = path.join(basedir, command),
        cmdBinary   = fs.exists(localBinary) ? localBinary : command,
        exec        = spawn(cmdBinary, commandArgs);

    cmdStack.push(exec);

    var argsMsg = (commandArgs !== undefined) ? commandArgs : "";
    cs.info(cmdBinary + " " + argsMsg);

    exec.stdout.setEncoding('utf8');
    exec.stdout.on('data', function(data) {
      console.log(data);
    });
    exec.stderr.setEncoding('utf8');
    exec.stderr.on('data', function(data) {
      console.log(data);
    });

    // If there's a callback, call that callback when the callback
    // needs to be called. Call it.
    var cb = callback;
    exec.on('close', function(code) {
      if (code == 0 && cb && typeof(cb) === "function") { cb(); }
      cs.info('Child process exited with code: ' + code);
      if (command == 'coffee') { die(exec); }
    });
  },
  set: function(property, value) {
    cs.settings[property] = value;
  }
}

var runCommand = function(){
  cmd.run(arguments)
}

runCommand.set = cmd.set;
runCommand.run = cmd.run;

module.exports = runCommand;
