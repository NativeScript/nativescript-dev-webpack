const ProjectSnapshotGenerator = require("../snapshot/android/project-snapshot-generator");
module.exports = function ($mobileHelper, hookArgs) {
	if ($mobileHelper.isAndroidPlatform(hookArgs.platformInfo.platform)) {
		ProjectSnapshotGenerator.cleanSnapshotArtefacts(hookArgs.platformInfo.projectData.projectDir);
	}
}
