const utils = require("./utils");
const { spawn } = require("child_process");
const { resolve: pathResolve } = require("path");
const { existsSync } = require("fs");
const readline = require("readline");

const { messages } = require("../plugins/WatchStateLoggerPlugin");
const { buildEnvData, debuggingEnabled, getUpdatedEmittedFiles } = require("./utils");

let hasBeenInvoked = false;

let webpackProcesses = {};
let hasLoggedSnapshotWarningMessage = false;

exports.getWebpackProcesses = function getWebpackProcess() {
    return webpackProcesses;
}

exports.runWebpackCompiler = function runWebpackCompiler(config, $projectData, $logger, $liveSyncService, hookArgs) {
    if (config.bundle) {
        return new Promise(function (resolveBase, rejectBase) {
            if (webpackProcesses[config.platform]) {
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

            // Currently externals param is passed only from before-preview-sync hook. This hook is triggered only when `tns preview --bundle` command is executed
            if (hookArgs && hookArgs.externals) {
                env.externals = hookArgs.externals;
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

                    const result = getUpdatedEmittedFiles(message.emittedFiles);

                    if (hookArgs.hmrData) {
                        hookArgs.hmrData[platform] = {
                            hash: result.hash || "",
                            fallbackFiles: result.fallbackFiles
                        };
                    }

                    if (hookArgs.filesToSyncMap && hookArgs.startSyncFilesTimeout) {
                        hookArgs.filesToSyncMap[platform] = result.emittedFiles;
                        hookArgs.startSyncFilesTimeout(platform);
                    } else if (hookArgs.filesToSync && hookArgs.startSyncFilesTimeout) {
                        hookArgs.filesToSync.push(...result.emittedFiles);
                        hookArgs.startSyncFilesTimeout(platform);
                    }
                }
            }

            if (config.watch) {
                childProcess.on("message", resolveOnWebpackCompilationComplete);
                if (webpackProcesses[platform]) {
                    throw new Error("Webpack process already spawned.");
                }
                webpackProcesses[platform] = childProcess;
            }

            childProcess.on("close", code => {
                if (webpackProcesses[platform] === childProcess) {
                    delete webpackProcesses[platform];
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

exports.stopWebpackCompiler = function stopWebpackCompiler($logger, platform) {
    if (platform) {
        stopWebpackForPlatform($logger, platform);
    } else {
        Object.keys(webpackProcesses).forEach(platform => stopWebpackForPlatform($logger, platform));
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
        if (typeof envValue === "undefined") {
            return;
        }
        if (typeof envValue === "boolean") {
            if (envValue) {
                args.push(`--env.${item}`);
            }
        } else {
            if (!Array.isArray(envValue)) {
                envValue = [envValue];
            }

            envValue.map(value => args.push(`--env.${item}=${value}`))
        }
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

function stopWebpackForPlatform($logger, platform) {
    $logger.trace(`Stopping webpack watch for platform ${platform}.`);
    const webpackProcess = webpackProcesses[platform];
    webpackProcess.kill("SIGINT");

    delete webpackProcesses[platform];
}

