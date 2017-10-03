const path = require("path");
const fs = require("fs");

const helpers = require("./projectHelpers");
const projectFilesManager = require("./projectFilesManager");
const npmScriptsManager = require("./npmScriptsManager");
const dependencyManager = require("./dependencyManager");

// INIT_CWD is available since npm 5.4
const initCwd = process.env.INIT_CWD;
const shouldUseInitCwd = () => {
    if (!initCwd) {
        return false;
    }

    const installedPackage = path.resolve(initCwd, "node_modules", "nativescript-dev-webpack");
    if (!fs.existsSync(installedPackage)) {
        return false;
    }

    const stat = fs.lstatSync(installedPackage);
    return stat.isSymbolicLink();
};

const PROJECT_DIR = shouldUseInitCwd() ?
    initCwd :
    path.dirname(path.dirname(__dirname));
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
