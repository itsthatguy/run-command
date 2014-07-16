
var util = require("util");
var path = require('path');
var spawn = require('win-spawn');

var basedir = path.join(__dirname, "node_modules", ".bin");
var commandArray = [];

var die = function(cmd) {
  i = commandArray.indexOf(cmd);
  commandArray.splice(i, 1);

  for (var i = 0; i < commandArray.length; i++) {
    commandArray[i].kill();
  }
}

function runCommand() {
  return {
    exec = function(command, args, callback) {
      var cmd = spawn(path.join(basedir, command), args);
      commandArray.push(cmd);

      cmd.stdout.setEncoding('utf8');
      cmd.stdout.on('data', function(data) {
        util.print(data);
      });
      cmd.stderr.setEncoding('utf8');
      cmd.stderr.on('data', function(data) {
        util.print(data);
      });

      // If there's a callback, call that callback when the callback
      // needs to be called. call it.
      var cb = callback;
      cmd.on('close', function(code) {
        if (code == 0 && cb && typeof(cb) === "function") { cb(); }
        util.print('Child process exited with code: ', code, "\n");
        if (args[0] == 'watch') { die(cmd); }
        if (command == 'coffee') { die(cmd); }
      });
    }
  }
}

module.exports = runCommand;
