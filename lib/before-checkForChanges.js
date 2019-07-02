module.exports = function ($staticConfig, hookArgs) {
    const majorVersionMatch = ($staticConfig.version || '').match(/^(\d+)\./);
    const majorVersion = majorVersionMatch && majorVersionMatch[1] && +majorVersionMatch[1];
    if (majorVersion && majorVersion < 6) {
        // check if we are using the bundle workflow or the legacy one.
        const isUsingBundleWorkflow = hookArgs &&
            hookArgs.checkForChangesOpts &&
            hookArgs.checkForChangesOpts.projectChangesOptions &&
            hookArgs.checkForChangesOpts.projectChangesOptions.bundle;

        if (isUsingBundleWorkflow) {
            const packageJsonData = require("../package.json")
            throw new Error(`The current version of ${packageJsonData.name} (${packageJsonData.version}) is not compatible with the used CLI: ${$staticConfig.version}. Please upgrade your NativeScript CLI version (npm i -g nativescript).`);
        }
    }
}