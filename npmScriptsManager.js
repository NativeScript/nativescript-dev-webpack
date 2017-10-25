const SCRIPT_TEMPLATES = Object.freeze({
    "ns-bundle": "ns-bundle",
    "start-[PLATFORM]-bundle": "npm run ns-bundle --[PLATFORM] --run-app",
    "build-[PLATFORM]-bundle": "npm run ns-bundle --[PLATFORM] --build-app",
    "publish-ios-bundle": "npm run ns-bundle --ios --publish-app",
    "generate-android-snapshot": "generate-android-snapshot --targetArchs arm,arm64,ia32 --install"
});

const DEPRECATED_SCRIPT_TEMPLATES = Object.freeze([
    "clean-[PLATFORM]",
    "prewebpack-[PLATFORM]",
    "webpack-[PLATFORM]",
    "prestart-[PLATFORM]-bundle",
    "start-[PLATFORM]-bundle",
    "prebuild-[PLATFORM]-bundle",
    "build-[PLATFORM]-bundle",
]);

const PLATFORMS = Object.freeze(["android", "ios"]);

function addNpmScripts(scripts = {}) {
    Object.keys(SCRIPT_TEMPLATES).forEach(name => {
        addPlatformScript(scripts, name, SCRIPT_TEMPLATES[name]);
    });
}

function removeDeprecatedNpmScripts(scripts) {
    return removeNpmScripts(scripts, DEPRECATED_SCRIPT_TEMPLATES);
}

function removeNpmScripts(scripts, scriptTemplates = Object.keys(SCRIPT_TEMPLATES)) {
    scriptTemplates.forEach(templateName => {
        removePlatformScripts(scripts, templateName);
    });
}

function addPlatformScript(scripts, nameTemplate, commandTemplate) {
    PLATFORMS.forEach(platform => {
        const name = nameTemplate.replace(/\[PLATFORM\]/g, platform);
        const command = commandTemplate.replace(/\[PLATFORM\]/g, platform);

        if (!scripts[name]) {
            console.info(`Registering script: ${name}`);
            scripts[name] = command;
        }
    });
}

function removePlatformScripts(scripts, nameTemplate) {
    PLATFORMS.forEach(platform => {
        const name = nameTemplate.replace(/\[PLATFORM\]/g, platform);
        delete scripts[name];
    });
}

module.exports = {
    addNpmScripts,
    removeDeprecatedNpmScripts,
    removeNpmScripts,
};
