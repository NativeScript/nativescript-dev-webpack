const path = require("path");
const fs = require("fs");

const helpers = require("./projectHelpers");
const projectFilesManager = require("./projectFilesManager");
const npmScriptsManager = require("./npmScriptsManager");
const dependencyManager = require("./dependencyManager");

const PROJECT_DIR = path.dirname(path.dirname(__dirname));
const APP_DIR = path.resolve(PROJECT_DIR, "app");

function install() {
    const packageJson = helpers.getPackageJson(PROJECT_DIR);

    projectFilesManager.addProjectFiles(PROJECT_DIR, APP_DIR);

    const scripts = packageJson.scripts || {};
    npmScriptsManager.removeDeprecatedNpmScripts(scripts);
    npmScriptsManager.addNpmScripts(scripts);
    packageJson.scripts = scripts;

    const postinstallOptions = dependencyManager.addProjectDeps(packageJson);
    packageJson.devDependencies = postinstallOptions.deps;

    helpers.writePackageJson(packageJson, PROJECT_DIR);

    dependencyManager.showHelperMessages(postinstallOptions);
}

function uninstall() {
    const packageJson = helpers.getPackageJson(PROJECT_DIR);

    projectFilesManager.removeProjectFiles(PROJECT_DIR, APP_DIR);

    console.log("Removing npm scripts...");
    npmScriptsManager.removeDeprecatedNpmScripts(packageJson);
    npmScriptsManager.removeNpmScripts(packageJson.scripts);

    helpers.writePackageJson(packageJson, PROJECT_DIR);

    console.log("NativeScript Webpack removed!");
}

module.exports = {
    install,
    uninstall,
};
