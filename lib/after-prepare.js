const snapshotGenerator = require("../snapshot/android/project-snapshot-generator");
const utils = require("./utils");

module.exports = function ($mobileHelper, $projectData, hookArgs) {
	if (utils.shouldSnapshot($mobileHelper, hookArgs.platform, hookArgs.appFilesUpdaterOptions.bundle)) {
		snapshotGenerator.installSnapshotArtefacts($projectData.projectDir);
	}
}
