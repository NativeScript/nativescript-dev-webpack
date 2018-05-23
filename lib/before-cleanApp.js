const { cleanSnapshotArtefacts } = require("../snapshot/android/project-snapshot-generator");
const { isAndroid } = require("../projectHelpers");
const { getWebpackProcess } = require("./compiler");

module.exports = function (hookArgs) {
    return (args, originalMethod) => {
        const webpackProcess = getWebpackProcess();
        const promise = webpackProcess ? Promise.resolve() : originalMethod(...args);
        return promise.then(() => {
            if (isAndroid(hookArgs.platformInfo.platform)) {
                cleanSnapshotArtefacts(hookArgs.platformInfo.projectData.projectDir);
             }
        });
    }
}
