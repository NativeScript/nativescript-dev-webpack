const { spawn } = require("child_process");
const { resolve: pathResolve } = require("path");

const { getPackageJson, getProjectDir, writePackageJson } = require("../projectHelpers");
const { forceUpdateProjectFiles } = require("../projectFilesManager");
const { forceUpdateProjectDeps } = require("../dependencyManager");
const { forceUpdateNpmScripts } = require("../npmScriptsManager");

const PLUGIN_NAME = "nativescript-dev-webpack";
const PROJECT_DIR = getProjectDir({ nestingLvl: 2 });

function update({
    deps: shouldUpdateDeps,
    scripts: shouldUpdateScripts,
    configs: shouldUpdateConfigs,
    projectDir = PROJECT_DIR
} = {}) {

    const commands = [];

    if (shouldUpdateDeps) {
        commands.push(() => updateDeps(projectDir));
    }

    if (shouldUpdateScripts) {
        commands.push(() => Promise.resolve(updateScripts(projectDir)));
    }

    if (shouldUpdateConfigs) {
        commands.push(() => Promise.resolve(updateConfigs(projectDir)));
    }

    return commands.reduce((current, next) => current.then(next), Promise.resolve());
}

function updateScripts(projectDir) {
    console.info("Updating npm scripts...");

    const packageJson = getPackageJson(projectDir);
    const scripts = packageJson.scripts || {};

    forceUpdateNpmScripts(scripts);
    packageJson.scripts = scripts;
    writePackageJson(packageJson, projectDir);
}

function updateDeps(projectDir) {
    console.info("Updating dev dependencies...");

    return new Promise((resolve, reject) => {
        const packageJson = getPackageJson(projectDir);
        const { deps } = forceUpdateProjectDeps(packageJson);
        packageJson.devDependencies = deps;
        writePackageJson(packageJson, projectDir);

        const command = `npm install --ignore-scripts`;
        execute(command).then(resolve).catch(reject);
    });
}

function updateConfigs(projectDir) {
    console.info("Updating configuration files...");

    const appDir = pathResolve(projectDir, "app");
    forceUpdateProjectFiles(projectDir, appDir);
}

function execute(command) {
    return new Promise((resolve, reject) => {
        const args = command.split(" ");
        spawnChildProcess(...args)
            .then(resolve) 
            .catch(throwError)
    });
}

function spawnChildProcess(command, ...args) {
    return new Promise((resolve, reject) => {
        const escapedArgs = args.map(a => `"${a}"`);

        const childProcess = spawn(command, escapedArgs, {
            stdio: "inherit",
            pwd: PROJECT_DIR,
            shell: true,
        });

        childProcess.on("close", code => {
            if (code === 0) {
                resolve();
            } else {
                reject({
                    code,
                    message: `child process exited with code ${code}`,
                });
            }
        });
    });
}

function throwError(error) {
    console.error(error.message);
    process.exit(error.code || 1);
}

module.exports = update;

