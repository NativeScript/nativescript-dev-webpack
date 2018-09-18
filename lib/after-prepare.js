const { installSnapshotArtefacts } = require("../snapshot/android/project-snapshot-generator");
const { shouldSnapshot } = require("./utils");

module.exports = function (hookArgs) {
	const env = hookArgs.env || {};
	env.hmr = hookArgs.appFilesUpdaterOptions.useHotModuleReload;
	const shouldSnapshotOptions = {
		platform: hookArgs.platform,
		bundle: hookArgs.appFilesUpdaterOptions.bundle,
		release: hookArgs.appFilesUpdaterOptions.release
	};

	if (env.snapshot && shouldSnapshot(shouldSnapshotOptions)) {
		installSnapshotArtefacts(hookArgs.projectData.projectDir);
	}
}
