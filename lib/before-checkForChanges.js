const { shouldSnapshot, isWinOS } = require("./utils");

module.exports = function ($staticConfig, hookArgs) {
    const cliVersion = $staticConfig.version || '';
    const versionsMatch = cliVersion.match(/^(\d+)\.(\d+)\.(\d+)/);
    const majorVersion = versionsMatch && versionsMatch[1] && +versionsMatch[1];
    const minorVersion = versionsMatch && versionsMatch[2] && +versionsMatch[2];

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
    } else {
        const env = hookArgs.prepareData.env || {};
        const shouldSnapshotOptions = {
            platform: hookArgs.prepareData.platform,
            release: hookArgs.prepareData.release
        };

        const shouldSnapshotOnWin = env.snapshot && shouldSnapshot(shouldSnapshotOptions) && isWinOS();
        const isCLIWithoutWinSnapshotsSupport = majorVersion && majorVersion == 6 && minorVersion && minorVersion < 2;
        if (shouldSnapshotOnWin && isCLIWithoutWinSnapshotsSupport) {
            throw new Error(`In order to generate Snapshots on Windows, please upgrade your NativeScript CLI version (npm i -g nativescript).`);
        }
    }
}