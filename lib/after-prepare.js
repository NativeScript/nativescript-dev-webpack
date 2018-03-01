const snapshotGenerator = require("../snapshot/android/project-snapshot-generator");
const utils = require("./utils");

module.exports = function ($mobileHelper, $projectData, hookArgs) {
	const env = hookArgs.env || {};
	const shouldSnapshotOptions = {
		platform: hookArgs.platform,
		bundle: hookArgs.appFilesUpdaterOptions.bundle,
		release: hookArgs.appFilesUpdaterOptions.release
	};

	if (env.snapshot && utils.shouldSnapshot($mobileHelper, shouldSnapshotOptions)) {
		snapshotGenerator.installSnapshotArtefacts($projectData.projectDir);
	}
}
