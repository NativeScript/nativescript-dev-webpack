const path = require("path");
const fs = require("fs");

const helpers = require("./projectHelpers");
const projectFilesManager = require("./projectFilesManager");
const npmScriptsManager = require("./npmScriptsManager");
const dependencyManager = require("./dependencyManager");

const PROJECT_DIR = path.dirname(path.dirname(__dirname));
const APP_DIR = path.resolve(PROJECT_DIR, "app");

function install() {
    let packageJson = helpers.getPackageJson(PROJECT_DIR);

    projectFilesManager.addProjectFiles(PROJECT_DIR, APP_DIR);

    let scripts = packageJson.scripts || {};
    scripts = npmScriptsManager.removeDeprecatedNpmScripts(scripts);
    scripts = npmScriptsManager.addNpmScripts(scripts);
    packageJson.scripts = scripts;

    packageJson.devDependencies = dependencyManager.addProjectDeps(packageJson);

    helpers.writePackageJson(packageJson, PROJECT_DIR);
}

function uninstall() {
    let packageJson = helpers.getPackageJson(PROJECT_DIR);

    projectFilesManager.removeProjectFiles(PROJECT_DIR, APP_DIR);
    npmScriptsManager.removeDeprecatedNpmScripts(packageJson);

    let scripts = packageJson.scripts;
    scripts = npmScriptsManager.removeNpmScripts(scripts);
    packageJson.scripts = scripts;

    helpers.writePackageJson(packageJson, PROJECT_DIR);
}

module.exports = {
    install,
    uninstall,
};
