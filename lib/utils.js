const os = require("os");

const { getProjectDir, getWebpackConfig } = require("../projectHelpers");

function shouldSnapshot($mobileHelper, config) {
    const platformSupportsSnapshot = $mobileHelper.isAndroidPlatform(config.platform);
    const osSupportsSnapshot = os.type() !== "Windows_NT";

    return config.bundle && config.release && platformSupportsSnapshot && osSupportsSnapshot;
}

function getCompilationContext() {
    const projectDir = getProjectDir();
    const config = getWebpackConfig(projectDir);
    const context = config.context || projectDir;

    return context;
}

module.exports = {
    shouldSnapshot,
    getCompilationContext,
};
