const { runWebpackCompiler } = require("./compiler");
const { setProcessInitDirectory } = require("./utils");

module.exports = function ($logger, hookArgs) {
    const env = hookArgs.config.env || {};
    const platform = hookArgs.config.platform;
    const appFilesUpdaterOptions = hookArgs.config.appFilesUpdaterOptions;
    const config = {
        env,
        platform,
        bundle: appFilesUpdaterOptions.bundle,
        release: appFilesUpdaterOptions.release,
    };

    const projectData = hookArgs.config.projectData;
    setProcessInitDirectory(projectData.projectDir);

    const result = config.bundle && runWebpackCompiler.bind(runWebpackCompiler, config, projectData, $logger, hookArgs);
    return result;
}
