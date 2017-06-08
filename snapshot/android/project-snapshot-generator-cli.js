const ProjectSnapshotGenerator = require("./project-snapshot-generator");
const args = require("./process-args-parser")();

const generator = new ProjectSnapshotGenerator(args);
generator.generate(args);
