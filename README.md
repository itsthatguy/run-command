# Run Commands

Run synchronous shell commands from within node

### Simple Example

```coffee
# postinstall.coffee

runCommand = require("run-command")

runCommand "bower", ['install'], ->
  runCommand "gulp"
```


### Slightly more Advanced Example

```coffee
# start.coffee

runCommand = require("run-command")

console.log(">> NODE_ENV: " + process.env.NODE_ENV)

runCommand("coffee", ['app.coffee'])

if (process.env.NODE_ENV == "development")
  runCommand "gulp", ['watch-pre-tasks'], ->
    runCommand("gulp", ['watch'])
```

### Configuration

```coffee
runCommand.set('info', false)    # turn off info messages
runCommand.set('warning', false) # turn off warning messages
runCommand.set('error', false)   # turn off error messages
```
