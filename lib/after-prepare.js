const { installSnapshotArtefacts } = require("../snapshot/android/project-snapshot-generator");
const { shouldSnapshot } = require("./utils");

module.exports = function (hookArgs) {
	const env = hookArgs.prepareData.env || {};
	const shouldSnapshotOptions = {
		platform: hookArgs.prepareData.platform,
		release: hookArgs.prepareData.release
	};

	if (env.snapshot && shouldSnapshot(shouldSnapshotOptions)) {
		installSnapshotArtefacts(hookArgs.prepareData.projectDir);
	}
}
