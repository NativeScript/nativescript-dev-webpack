const utils = require("./utils");
const { spawn } = require("child_process");
const { join, resolve: pathResolve } = require("path");
const { existsSync } = require("fs");
const readline = require("readline");

const { messages } = require("../plugins/WatchStateLoggerPlugin");
const { buildEnvData, getCompilationContext } = require("./utils");

let hasBeenInvoked = false;

let webpackProcess = null;
let hasLoggedSnapshotWarningMessage = false;

exports.getWebpackProcess = function getWebpackProcess() {
    return webpackProcess;
}

exports.runWebpackCompiler = function runWebpackCompiler(config, $projectData, $logger, hookArgs) {
    if (config.bundle) {
        return new Promise(function (resolveBase, rejectBase) {
            if (webpackProcess) {
                return resolveBase();
            }

            let isResolved = false;
            function resolve() {
                if (isResolved) return;
                isResolved = true;
                resolveBase();
            }
            function reject(error) {
                if (isResolved) return;
                isResolved = true;
                rejectBase(error);
            }

            console.log(`Running webpack for ${config.platform}...`);

            const projectDir = $projectData.projectDir;
            const { platform, env } = config;
            const envData = buildEnvData($projectData, platform, env);
            const envParams = buildEnvCommandLineParams(config, envData, $logger);

            // Adding `npm i source-map-support --save-dev` in an app will make source maps work
            // and stack traces will point to .ts if .ts files and proper source maps exist.
            let sourceMapSupportArgs = [];
            const appSourceMapSupportInstallPath = pathResolve(projectDir, "node_modules", "source-map-support", "register.js");
            const devDepSourceMapSupportInstallPath = pathResolve(__dirname, "..", "node_modules", "source-map-support", "register.js");
            if (existsSync(appSourceMapSupportInstallPath)) {
                sourceMapSupportArgs = ["--require", appSourceMapSupportInstallPath];
            } else if (existsSync(devDepSourceMapSupportInstallPath)) {
                sourceMapSupportArgs = ["--require", devDepSourceMapSupportInstallPath];
            }

            const args = [
                "--preserve-symlinks",
                ...sourceMapSupportArgs,
                pathResolve(projectDir, "node_modules", "webpack", "bin", "webpack.js"),
                `--config=${pathResolve(projectDir, "webpack.config.js")}`,
                ...(config.watch ? ["--watch"] : []),
                ...envParams,
            ].filter(a => !!a);

            const childProcess = spawn("node", args, {
                // Watch opens IPC so we don't mess with the stdin/out/err.
                // These will notify us for the webpack compilation states.
                // Enables `childProcess.on("message", msg => ...)` kind of communication.
                stdio: config.watch ? ["inherit", "inherit", "inherit", "ipc"] : "inherit",
                cwd: projectDir
            });

            let isFirstWebpackWatchCompilation = true;
            function resolveOnWebpackCompilationComplete(message) {
                if (message === messages.compilationComplete) {
                    console.log("Webpack build done!");
                    resolve();
                }

                if (message.emittedFiles) {
                    if (isFirstWebpackWatchCompilation) {
                        isFirstWebpackWatchCompilation = false;
                        return;
                    }

                    if (hookArgs.filesToSync && hookArgs.startSyncFilesTimeout) {
                        const compilationContext = getCompilationContext(projectDir, envData);
                        hookArgs.filesToSync.push(
                            ...message.emittedFiles.map(
                                emittedFile => join(projectDir, compilationContext, emittedFile)
                            )
                        );
                        hookArgs.startSyncFilesTimeout();
                    }
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

function buildEnvCommandLineParams(config, envData, $logger) {
    const envFlagNames = Object.keys(envData);
    const snapshotEnvIndex = envFlagNames.indexOf("snapshot");
    if (snapshotEnvIndex > -1 && !utils.shouldSnapshot(config)) {
        logSnapshotWarningMessage($logger);
        envFlagNames.splice(snapshotEnvIndex, 1);
    }

    return envFlagNames.map(item => `--env.${item}=${envData[item]}`);
}

function logSnapshotWarningMessage($logger) {
    if (!hasLoggedSnapshotWarningMessage) {
        $logger.warn("Stripping the snapshot flag. " +
            "Bear in mind that snapshot is only available in release builds and " +
            "is NOT available on Windows systems.");

        hasLoggedSnapshotWarningMessage = true;
    }
}

