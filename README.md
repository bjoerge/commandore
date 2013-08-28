# Commandore

Serialize and store commands for later execution

Work in progress


## Usage

```javascript
var commandore = require("commandore");

// Register the command with a function that will execute it
commandore.setHandler("do-something", function(data) {
  console.log("Did something with ", data);
});

// Store the command for later execution
var command = commandore.store("do-something", {foo: "bar"});

// Alternative 1: execute immediately
command();
//=> Did something with {foo: "bar"}

// Alternative 2: Execute later (i.e. after page refresh)
commandore.resume()

//=> Did something with {foo: "bar"}
```