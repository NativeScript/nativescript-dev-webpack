const { runWebpackCompiler } = require("./compiler");

module.exports = function ($mobileHelper, $projectData, hookArgs) {
	if (hookArgs.config) {
		const appFilesUpdaterOptions = hookArgs.config.appFilesUpdaterOptions;
		if (appFilesUpdaterOptions.bundle) {
			const platforms = hookArgs.config.platforms;
			platforms.forEach(platform => {
				const env = hookArgs.config.env || {};
				const config = {
					env,
					platform,
					bundle: appFilesUpdaterOptions.bundle,
					watch: true
				};

				runWebpackCompiler(config, $mobileHelper, $projectData, hookArgs);
			});
		}
	}
}
