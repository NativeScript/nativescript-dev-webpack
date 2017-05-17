var ProjectSnapshotGenerator = require("./project-snapshot-generator");
var args = require("./process-args-parser")();

var generator = new ProjectSnapshotGenerator(args);
generator.generate(args);
