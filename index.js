
var util  = require("util"),
    path  = require('path'),
    spawn = require('win-spawn'),
    fs    = require('fs'),
    log   = require('custom-logger').config({ format: "[%timestamp%] [run-command] %event% ->%message%" });

var basedir = path.join(process.env.PWD, "node_modules", ".bin");
var commandArray = [];

var die = function(cmd) {
  i = commandArray.indexOf(cmd);
  commandArray.splice(i, 1);

  for (var i = 0; i < commandArray.length; i++) {
    commandArray[i].kill();
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
  run: function(command, args, callback) {
    if (typeof(command) === "object") {
      callback = command[2];
      args = command[1];
      command = command[0];
    }

    var localBinary = path.join(basedir, command),
        cmdBinary   = fs.exists(localBinary) ? localBinary : command,
        cmd         = spawn(cmdBinary, args);
    commandArray.push(cmd);

    var argsMsg = (args !== undefined) ? args.toString() : "";
    cs.info( cmdBinary + " " + argsMsg );

    cmd.stdout.setEncoding('utf8');
    cmd.stdout.on('data', function(data) {
      util.print(data);
    });
    cmd.stderr.setEncoding('utf8');
    cmd.stderr.on('data', function(data) {
      util.print(data);
    });

    // If there's a callback, call that callback when the callback
    // needs to be called. Call it.
    var cb = callback;
    cmd.on('close', function(code) {
      if (code == 0 && cb && typeof(cb) === "function") { cb(); }
      cs.info('Child process exited with code: ' + code);
      if (command == 'coffee') { die(cmd); }
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
