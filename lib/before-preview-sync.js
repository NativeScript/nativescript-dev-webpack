const { runWebpackCompiler } = require("./compiler");

module.exports = function($logger, $liveSyncService, hookArgs) {
	const { config } = hookArgs;
	const bundle = config && config.appFilesUpdaterOptions && config.appFilesUpdaterOptions.bundle;
	if (bundle) {
		const env = config.env || {};
		env.hmr = config.appFilesUpdaterOptions.useHotModuleReload;
		const platform = config.platform;
		const release = config && config.appFilesUpdaterOptions && config.appFilesUpdaterOptions.release;
		const compilerConfig = {
			env,
			platform,
			bundle,
			release,
			watch: true
		};

		return runWebpackCompiler(compilerConfig, hookArgs.projectData, $logger, $liveSyncService, hookArgs);
	}
}

