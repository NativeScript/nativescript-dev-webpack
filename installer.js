const path = require("path");
const fs = require("fs");
const childProcess = require("child_process");

const helpers = require("./projectHelpers");
const projectFilesManager = require("./projectFilesManager");
const npmScriptsManager = require("./npmScriptsManager");
const dependencyManager = require("./dependencyManager");

const isWin = /^win/.test(process.platform);
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

    if (postinstallOptions.newDepsAdded) {
        // Execute `npm install` after everything else
        setTimeout(() => {
            executeNpmInstall();
            dependencyManager.showHelperMessages(postinstallOptions);
        }, 300);
    } else {
        dependencyManager.showHelperMessages(postinstallOptions);
    }
}

function executeNpmInstall() {
    console.log("Installing new devDependencies ...");
    let spawnArgs = [];
    let command = "";

    if (isWin) {
        command = "cmd.exe";
        spawnArgs = ["/c", "npm", "install"];
    } else {
        command = "npm";
        spawnArgs = ["install"];
    }

    childProcess.spawnSync(command, spawnArgs, { cwd: PROJECT_DIR, stdio: "inherit" });
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
