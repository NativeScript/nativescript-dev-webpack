const os = require("os");
const path = require("path");

const {
    getAppPathFromProjectData,
    getAppResourcesPathFromProjectData,
    getProjectDir,
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

function shouldSnapshot(config) {
    const platformSupportsSnapshot = isAndroid(config.platform);
    const osSupportsSnapshot = os.type() !== "Windows_NT";

    return config.bundle && config.release && platformSupportsSnapshot && osSupportsSnapshot;
}

module.exports = {
    buildEnvData,
    shouldSnapshot
};
