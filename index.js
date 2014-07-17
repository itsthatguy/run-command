
var util  = require("util"),
    path  = require('path'),
    spawn = require('win-spawn'),
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
cs = {
  info    : function(msg) {
    log.info(strip(msg));
  },
  warning : function(msg) {
    log.warning(strip(msg));
  },
  error   : function(msg) {
    log.error(strip(msg));
  }
}

function runCommand(command, args, callback) {

  var cmd = spawn(path.join(basedir, command), args);
  commandArray.push(cmd);

  cs.info( path.join(basedir, command) + " " + args.toString() );

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
}

module.exports = runCommand;
