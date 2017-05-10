const SCRIPT_TEMPLATES = Object.freeze({
    "ns-bundle": "ns-bundle",
    "start-[PLATFORM]-bundle": "npm run ns-bundle --[PLATFORM] --start-app",
    "build-[PLATFORM]-bundle": "npm run ns-bundle --[PLATFORM] --build-app",
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

function addNpmScripts(scripts) {
    scripts = scripts || {};

    Object.keys(SCRIPT_TEMPLATES).forEach(name => {
        packageJson = addPlatformScript(scripts, name, SCRIPT_TEMPLATES[name]);
    });

    return scripts;
}

function removeDeprecatedNpmScripts(scripts) {
    return removeNpmScripts(scripts, DEPRECATED_SCRIPT_TEMPLATES);
}

function removeNpmScripts(scripts, scriptTemplates = Object.keys(SCRIPT_TEMPLATES)) {
    scriptTemplates.forEach(function(templateName) {
        scripts = removePlatformScripts(scripts, templateName);
    });

    return scripts;
}

function addPlatformScript(scripts, nameTemplate, commandTemplate) {
    PLATFORMS.forEach(function (platform) {
        const name = nameTemplate.replace(/\[PLATFORM\]/g, platform);
        const command = commandTemplate.replace(/\[PLATFORM\]/g, platform);

        if (!scripts[name]) {
            console.info(`Registering script: ${name}`);
            scripts[name] = command;
        }
    });

    return scripts;
}

function removePlatformScripts(scripts, nameTemplate) {
    if (!scripts || Object.keys(SCRIPT_TEMPLATES).includes(nameTemplate)) {
        return scripts;
    }

    PLATFORMS.forEach(function (platform) {
        const name = nameTemplate.replace(/\[PLATFORM\]/g, platform);

        if (scripts[name]) {
            console.info(`Removing script: ${name}`);
            delete scripts[name];
        }
    });

    return scripts;
}

module.exports = {
    addNpmScripts,
    removeDeprecatedNpmScripts,
    removeNpmScripts,
};
