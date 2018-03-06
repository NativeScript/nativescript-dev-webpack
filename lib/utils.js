const os = require("os");
const path = require("path");

const { getProjectDir, getWebpackConfig } = require("../projectHelpers");

function buildEnvData(platform, env) {
    return {
        ...env,
        [platform.toLowerCase()]: true,
    };
}

function getCompilationContext(env) {
    const projectDir = getProjectDir();
    const config = getWebpackConfig(projectDir, env);
    const context = config.context || projectDir;
    const absolutePathToContext = path.resolve(context);

    return absolutePathToContext;
}

function shouldSnapshot($mobileHelper, config) {
    const platformSupportsSnapshot = $mobileHelper.isAndroidPlatform(config.platform);
    const osSupportsSnapshot = os.type() !== "Windows_NT";

    return config.bundle && config.release && platformSupportsSnapshot && osSupportsSnapshot;
}

module.exports = {
    buildEnvData,
    getCompilationContext,
    shouldSnapshot,
};
