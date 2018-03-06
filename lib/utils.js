const os = require("os");
const path = require("path");

const { getProjectDir, getWebpackConfig } = require("../projectHelpers");

function buildEnvData(platform, env) {
    return Object.assign({},
        env,
        { [platform.toLowerCase()]: true }
    );
}

function getCompilationContext(env) {
    const projectDir = getProjectDir();
    const config = getWebpackConfig(projectDir, env);
    const { context } = config;

    return context ?
        path.relative(projectDir, context) :
        ".";
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
