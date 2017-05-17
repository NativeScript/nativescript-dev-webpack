var SnapshotGenerator = require("./snapshot-generator");
var args = require("./process-args-parser")();

var generator = new SnapshotGenerator(args);
generator.generate(args);
