const { getWebpackProcesses, runWebpackCompiler, stopWebpackCompiler } = require("./compiler");
const { addListener } = require("./utils");

module.exports = function ($logger, $liveSyncService, $devicesService, hookArgs) {
    if (hookArgs.config) {
        const appFilesUpdaterOptions = hookArgs.config.appFilesUpdaterOptions;
        if (appFilesUpdaterOptions.bundle) {
            addListener($liveSyncService, "liveSyncStopped", () => {
                const webpackProcesses = getWebpackProcesses();
                Object.keys(webpackProcesses).forEach(platform => {
                    const devices = $devicesService.getDevicesForPlatform(platform);
                    if (!devices || !devices.length) {
                        stopWebpackCompiler($logger, platform);
                    }
                });
            });
            addListener(process, "exit", () => stopWebpackCompiler($logger));

            const platforms = hookArgs.config.platforms;
            return Promise.all(platforms.map(platform => {
                const env = hookArgs.config.env || {};
                env.hmr = appFilesUpdaterOptions.useHotModuleReload;
                const config = {
                    env,
                    platform,
                    bundle: appFilesUpdaterOptions.bundle,
                    release: appFilesUpdaterOptions.release,
                    watch: true
                };

                return runWebpackCompiler(config, hookArgs.projectData, $logger, $liveSyncService, hookArgs);
            }));
        }
    }
}
