const { cleanSnapshotArtefacts } = require("../snapshot/android/project-snapshot-generator");
const { isAndroid } = require("../projectHelpers");

module.exports = function (hookArgs) {
    if (isAndroid(hookArgs.platformInfo.platform)) {
        cleanSnapshotArtefacts(hookArgs.platformInfo.projectData.projectDir);
    }
}
