const { cleanSnapshotArtefacts } = require("../snapshot/android/project-snapshot-generator");
const { isAndroid } = require("../projectHelpers");
const { getWebpackProcesses } = require("./compiler");

module.exports = function (hookArgs) {
    return (args, originalMethod) => {
        const platform = hookArgs.platformInfo.platform;
        const webpackProcesses = getWebpackProcesses();
        const promise = webpackProcesses[platform] ? Promise.resolve() : originalMethod(...args);
        return promise.then(() => {
            if (isAndroid(platform)) {
                cleanSnapshotArtefacts(hookArgs.platformInfo.projectData.projectDir);
             }
        });
    }
}
