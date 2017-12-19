const path = require("path");
const fs = require("fs");

const helpers = require("./projectHelpers");
const projectFilesManager = require("./projectFilesManager");
const dependencyManager = require("./dependencyManager");

const PROJECT_DIR = helpers.getProjectDir({ nestingLvl: 2 });
const APP_DIR = path.resolve(PROJECT_DIR, "app");

function install() {
    const packageJson = helpers.getPackageJson(PROJECT_DIR);

    projectFilesManager.addProjectFiles(PROJECT_DIR, APP_DIR);

    const postinstallOptions = dependencyManager.addProjectDeps(packageJson);
    packageJson.devDependencies = postinstallOptions.deps;

    helpers.writePackageJson(packageJson, PROJECT_DIR);

    dependencyManager.showHelperMessages(postinstallOptions);
}

function uninstall() {
    projectFilesManager.removeProjectFiles(PROJECT_DIR, APP_DIR);
    console.log("NativeScript Webpack removed!");
}

module.exports = {
    install,
    uninstall,
};
