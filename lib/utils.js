const os = require("os");

const {
    getAppPathFromProjectData,
    getAppResourcesPathFromProjectData,
    isAndroid,
} = require("../projectHelpers");

const eventHandlers = {};

function debuggingEnabled(liveSyncService, projectDir) {
    const deviceDescriptors = liveSyncService.getLiveSyncDeviceDescriptors(projectDir);
    return deviceDescriptors.some(device => device.debugggingEnabled);
}

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

/**
 * Checks if there's a file in the following pattern 5e0326f3bb50f9f26cf0.hot-update.json
 * if yes this is a HMR update and remove all bundle files as we don't need them to be synced,
 * but only the update chunks
 */
function getUpdatedEmittedFiles(emittedFiles) {
    let fallbackFiles = [];
    let hotHash;
    if (emittedFiles.some(x => x.endsWith('.hot-update.json'))) {
        let result = emittedFiles.slice();
        const hotUpdateScripts = emittedFiles.filter(x => x.endsWith('.hot-update.js'));
        hotUpdateScripts.forEach(hotUpdateScript => {
            const { name, hash } = parseHotUpdateChunkName(hotUpdateScript);
            hotHash = hash;
            // remove bundle/vendor.js files if there's a bundle.XXX.hot-update.js or vendor.XXX.hot-update.js
            result = result.filter(file => file !== `${name}.js`);
        });
        //if applying of hot update fails, we must fallback to the full files
        fallbackFiles = emittedFiles.filter(file => result.indexOf(file) === -1);
        return { emittedFiles: result, fallbackFiles, hash: hotHash };
    }
    else {
        return { emittedFiles, fallbackFiles };
    }
}

/**
 * Parse the filename of the hot update chunk.
 * @param name bundle.deccb264c01d6d42416c.hot-update.js
 * @returns { name: string, hash: string } { name: 'bundle', hash: 'deccb264c01d6d42416c' }
 */
function parseHotUpdateChunkName(name) {
    const matcher = /^(.+)\.(.+)\.hot-update/gm;
    const matches = matcher.exec(name);
    return {
        name: matches[1] || "",
        hash: matches[2] || "",
    };
}

function shouldSnapshot(config) {
    const platformSupportsSnapshot = isAndroid(config.platform);
    const osSupportsSnapshot = os.type() !== "Windows_NT";

    return config.bundle && config.release && platformSupportsSnapshot && osSupportsSnapshot;
}

function addListener(eventEmitter, name, handler) {
    if (!eventHandlers[name]) {
        eventEmitter.on(name, handler);
        eventHandlers[name] = handler;
    }
}

function removeListener(eventEmitter, name) {
    if (eventHandlers[name]) {
        eventEmitter.removeListener(name, eventHandlers[name]);
        delete eventHandlers[name];
    }
}

function convertToUnixPath(relativePath) {
    return relativePath.replace(/\\/g, "/");
}

module.exports = {
    buildEnvData,
    debuggingEnabled,
    shouldSnapshot,
    getUpdatedEmittedFiles,
    parseHotUpdateChunkName,
    addListener,
    removeListener,
    convertToUnixPath
};
