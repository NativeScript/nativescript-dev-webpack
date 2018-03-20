const { runWebpackCompiler } = require("./compiler");

module.exports = function ($projectData, $logger, hookArgs) {
	if (hookArgs.config) {
		const appFilesUpdaterOptions = hookArgs.config.appFilesUpdaterOptions;
		if (appFilesUpdaterOptions.bundle) {
			const platforms = hookArgs.config.platforms;
			return Promise.all(platforms.map(platform => {
				const env = hookArgs.config.env || {};
				const config = {
					env,
					platform,
					bundle: appFilesUpdaterOptions.bundle,
					release: appFilesUpdaterOptions.release,
					watch: true
				};

				return runWebpackCompiler(config, $projectData, $logger, hookArgs);
			}));
		}
	}
}
