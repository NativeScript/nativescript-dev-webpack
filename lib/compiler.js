const utils = require("./utils");
const { spawn } = require("child_process");
const { join, resolve: pathResolve } = require("path");
const { existsSync } = require("fs");
const readline = require("readline");
const { messages } = require("../plugins/WatchStateLoggerPlugin");

let hasBeenInvoked = false;

let webpackProcess = null;

exports.getWebpackProcess = function getWebpackProcess() {
    return webpackProcess;
}

exports.runWebpackCompiler = function runWebpackCompiler(config, $mobileHelper, $projectData, hookArgs, originalArgs, originalMethod) {
    if (config.bundle) {
        return new Promise(function (resolveBase, rejectBase) {
            if (hookArgs && hookArgs.config && hookArgs.config.changesInfo) {
                hookArgs.config.changesInfo.nativeChanged = true;
            }

            let isResolved = false;
            function resolve() {
                if (isResolved) return;
                isResolved = true;
                if (childProcess) {
                    childProcess.removeListener("message", resolveOnWebpackCompilationComplete);
                }
                resolveBase();
            }
            function reject(error) {
                if (isResolved) return;
                isResolved = true;
                if (childProcess) {
                    childProcess.removeListener("message", resolveOnWebpackCompilationComplete);
                }
                rejectBase(error);
            }

            console.log(`Running webpack for ${config.platform}...`);
            const envFlagNames = Object.keys(config.env).concat([config.platform.toLowerCase()]);

            const snapshotEnvIndex = envFlagNames.indexOf("snapshot");
            if (snapshotEnvIndex !== -1 && !utils.shouldSnapshot($mobileHelper, config.platform, config.bundle)) {
                envFlagNames.splice(snapshotEnvIndex, 1);
            }

            // Adding `npm i source-map-support --save-dev` in an app will make source maps work
            // and stack traces will point to .ts if .ts files and proper source maps exist.
            let sourceMapSupportArgs = [];
            const appSourceMapSupportInstallPath = pathResolve($projectData.projectDir, "node_modules", "source-map-support", "register.js");
            const devDepSourceMapSupportInstallPath = pathResolve(__dirname, "..", "node_modules", "source-map-support", "register.js");
            if (existsSync(appSourceMapSupportInstallPath)) {
                sourceMapSupportArgs = ["--require", appSourceMapSupportInstallPath];
            } else if (existsSync(devDepSourceMapSupportInstallPath)) {
                sourceMapSupportArgs = ["--require", devDepSourceMapSupportInstallPath];
            }

            const args = [
                "--preserve-symlinks",
                ...sourceMapSupportArgs,
                join($projectData.projectDir, "node_modules", "webpack", "bin", "webpack.js"),
                "--config=webpack.config.js",
                "--progress",
                ...(config.watch ? ["--watch"] : []),
                ...envFlagNames.map(item => `--env.${item}`),
            ].filter(a => !!a);

            const childProcess = spawn("node", args, {
                // Watch opens IPC so we don't mess with the stdin/out/err.
                // These will notify us for the webpack compilation states.
                // Enables `childProcess.on("message", msg => ...)` kind of communication.
                stdio: config.watch ? ["inherit", "inherit", "inherit", "ipc"] : "inherit",
                cwd: $projectData.projectDir
            });

            function resolveOnWebpackCompilationComplete(message) {
                if (message === messages.compilationComplete) {
                    console.log("Initial webpack build done!");
                    resolve();
                }
            }

            if (config.watch) {
                childProcess.on("message", resolveOnWebpackCompilationComplete);
                if (webpackProcess) {
                    throw new Error("Webpack process already spawned.");
                }
                webpackProcess = childProcess;
            }

            childProcess.on("close", code => {
                if (webpackProcess == childProcess) {
                    webpackProcess = null;
                }
                if (code === 0) {
                    resolve();
                } else {
                    const error = new Error(`Executing webpack failed with exit code ${code}.`);
                    error.code = code;
                    reject(error);
                }
            });
        });
    }
}
