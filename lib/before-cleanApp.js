const { cleanSnapshotArtefacts } = require("../snapshot/android/project-snapshot-generator");
const { isAndroid } = require("../projectHelpers");
const { setProcessInitDirectory } = require("./utils");

module.exports = function (hookArgs) {
    if (isAndroid(hookArgs.platformInfo.platform)) {
        const projectDir = hookArgs.platformInfo.projectData.projectDir;
        setProcessInitDirectory(projectDir);
        cleanSnapshotArtefacts(projectDir);
    }
}
