const utils = require("./utils");
const { spawn } = require("child_process");
const { resolve: pathResolve } = require("path");
const { existsSync } = require("fs");
const readline = require("readline");

const { messages } = require("../plugins/WatchStateLoggerPlugin");
const { buildEnvData, debuggingEnabled } = require("./utils");

let hasBeenInvoked = false;

let webpackProcess = null;
let hasLoggedSnapshotWarningMessage = false;

exports.getWebpackProcess = function getWebpackProcess() {
    return webpackProcess;
}

exports.runWebpackCompiler = function runWebpackCompiler(config, $projectData, $logger, $liveSyncService, hookArgs) {
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
            if (debuggingEnabled($liveSyncService, projectDir)) {
                env["sourceMap"] = true;
            }

            const envData = buildEnvData($projectData, platform, env);
            const envParams = buildEnvCommandLineParams(config, envData, $logger);

            const args = [
                "--preserve-symlinks",
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
                        hookArgs.filesToSync.push(...message.emittedFiles);
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

    const args = [];
    envFlagNames.map(item => {
        let envValue = envData[item];
        if(!Array.isArray(envValue)) {
            envValue = [envValue];
        }
        envValue.map(value => args.push(`--env.${item}=${value}`))
    });
    
    return args;
}

function logSnapshotWarningMessage($logger) {
    if (!hasLoggedSnapshotWarningMessage) {
        $logger.warn("Stripping the snapshot flag. " +
            "Bear in mind that snapshot is only available in release builds and " +
            "is NOT available on Windows systems.");

        hasLoggedSnapshotWarningMessage = true;
    }
}

