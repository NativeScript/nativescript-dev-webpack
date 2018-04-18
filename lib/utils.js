const os = require("os");
const path = require("path");

const {
    getAppPathFromProjectData,
    getAppResourcesPathFromProjectData,
    getProjectDir,
    getWebpackConfig,
    isAndroid,
} = require("../projectHelpers");

function buildEnvData($projectData, platform, env) {
    const envData = Object.assign({},
        env,
        { [platform.toLowerCase()]: true }
    );

    const appPath = getAppPathFromProjectData($projectData);
    const appResourcesPath = getAppResourcesPathFromProjectData($projectData);
    Object.assign(envData,
        appPath && { appPath },
        appResourcesPath && { appResourcesPath }
    );

    return envData;
}

function getCompilationContext(projectDir, env) {
    const config = getWebpackConfig(projectDir, env);
    const { context } = config;

    return context ?
        path.relative(projectDir, context) :
        ".";
}

function shouldSnapshot(config) {
    const platformSupportsSnapshot = isAndroid(config.platform);
    const osSupportsSnapshot = os.type() !== "Windows_NT";

    return config.bundle && config.release && platformSupportsSnapshot && osSupportsSnapshot;
}

module.exports = {
    buildEnvData,
    getCompilationContext,
    shouldSnapshot
};
