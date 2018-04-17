const { runWebpackCompiler } = require("./compiler");
const { setProcessInitDirectory } = require("./utils");

module.exports = function ($logger, hookArgs) {
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

				const projectData = hookArgs.projectData;
				setProcessInitDirectory(projectData.projectDir);
				return runWebpackCompiler(config, projectData, $logger, hookArgs);
			}));
		}
	}
}
