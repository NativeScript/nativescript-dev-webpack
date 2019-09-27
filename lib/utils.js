const os = require("os");
const { isAndroid } = require("../projectHelpers");

function shouldSnapshot(config) {
    const platformSupportsSnapshot = isAndroid(config.platform);

    return config.release && platformSupportsSnapshot;
}

function convertToUnixPath(relativePath) {
    return relativePath.replace(/\\/g, "/");
}

function isWinOS() {
    return os.type() === "Windows_NT";
}

module.exports = {
    shouldSnapshot,
    convertToUnixPath,
    isWinOS
};
