const { runWebpackCompiler } = require("./compiler");

module.exports = function ($mobileHelper, $projectData, hookArgs) {
	const env = hookArgs.config.env || {};
	const platform = hookArgs.config.platform;
	const appFilesUpdaterOptions = hookArgs.config.appFilesUpdaterOptions;
	const config = {
		env,
		platform,
		bundle: appFilesUpdaterOptions.bundle
	};
	const result = config.bundle && runWebpackCompiler.bind(runWebpackCompiler, config, $mobileHelper, $projectData, hookArgs);
	return result;
}
