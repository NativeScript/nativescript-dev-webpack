const { runWebpackCompiler } = require("./compiler");

module.exports = function ($logger, $liveSyncService, hookArgs) {
    const platform = hookArgs.config.platform;
    const appFilesUpdaterOptions = hookArgs.config.appFilesUpdaterOptions;
    const env = hookArgs.config.env || {};
    env.hmr = appFilesUpdaterOptions.useHotModuleReload;
    const config = {
        env,
        platform,
        bundle: appFilesUpdaterOptions.bundle,
        release: appFilesUpdaterOptions.release,
    };

    const result = config.bundle && runWebpackCompiler.bind(runWebpackCompiler, config, hookArgs.config.projectData, $logger, $liveSyncService, hookArgs);
    return result;
}
