const os = require("os");
const { isAndroid } = require("../projectHelpers");

function shouldSnapshot(config) {
    const platformSupportsSnapshot = isAndroid(config.platform);

    return config.release && platformSupportsSnapshot;
}

function convertToUnixPath(relativePath) {
    return relativePath.replace(/\\/g, "/");
}

module.exports = {
    shouldSnapshot,
    convertToUnixPath
};
