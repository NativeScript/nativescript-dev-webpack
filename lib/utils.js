const os = require("os");
const { isAndroid } = require("../projectHelpers");

function shouldSnapshot(config) {
    const platformSupportsSnapshot = isAndroid(config.platform);
    const osSupportsSnapshot = os.type() !== "Windows_NT";

    return config.release && platformSupportsSnapshot && osSupportsSnapshot;
}

function convertToUnixPath(relativePath) {
    return relativePath.replace(/\\/g, "/");
}

module.exports = {
    shouldSnapshot,
    convertToUnixPath
};
