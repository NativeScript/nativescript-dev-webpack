const { runWebpackCompiler } = require("./compiler");

module.exports = function ($projectData, $logger, hookArgs) {
    const env = hookArgs.config.env || {};
    const platform = hookArgs.config.platform;
    const appFilesUpdaterOptions = hookArgs.config.appFilesUpdaterOptions;
    const config = {
        env,
        platform,
        bundle: appFilesUpdaterOptions.bundle,
        release: appFilesUpdaterOptions.release,
    };
    const result = config.bundle && runWebpackCompiler.bind(runWebpackCompiler, config, $projectData, $logger, hookArgs);
    return result;
}
