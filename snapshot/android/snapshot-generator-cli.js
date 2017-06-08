const SnapshotGenerator = require("./snapshot-generator");
const args = require("./process-args-parser")();

const generator = new SnapshotGenerator(args);
generator.generate(args);
