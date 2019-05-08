import { join } from "path";

export enum messages {
    compilationComplete = "Webpack compilation complete.",
    startWatching = "Webpack compilation complete. Watching for file changes.",
    changeDetected = "File change detected. Starting incremental webpack compilation..."
}

/**
 * This little plugin will report the webpack state through the console.
 * So the {N} CLI can get some idea when compilation completes.
 */
export class WatchStateLoggerPlugin {
    isRunningWatching: boolean;
    apply(compiler) {
        const plugin = this;
        compiler.hooks.watchRun.tapAsync("WatchStateLoggerPlugin", function (compiler, callback) {
            plugin.isRunningWatching = true;
            if (plugin.isRunningWatching) {
                console.log(messages.changeDetected);
            }
            process.send && process.send(messages.changeDetected, error => null);
            callback();
        });
        compiler.hooks.afterEmit.tapAsync("WatchStateLoggerPlugin", function (compilation, callback) {
            callback();

            if (plugin.isRunningWatching) {
                console.log(messages.startWatching);
            } else {
                console.log(messages.compilationComplete);
            }

            const runtimeOnlyFiles = getWebpackRuntimeOnlyFiles(compilation, compiler.context);
            let emittedFiles = Object
                .keys(compilation.assets)
                .filter(assetKey => compilation.assets[assetKey].emitted);

            process.send && process.send(messages.compilationComplete, error => null);
            // Send emitted files so they can be LiveSynced if need be
            process.send && process.send({ emittedFiles, webpackRuntimeFiles: runtimeOnlyFiles }, error => null);
        });
    }
}

function getWebpackRuntimeOnlyFiles(compilation, basePath) {
    let runtimeOnlyFiles = [];
    try {
        runtimeOnlyFiles = [].concat(...Array.from<any>(compilation.entrypoints.values())
            .map(entrypoint => entrypoint.runtimeChunk)
            // filter embedded runtime chunks (e.g. part of bundle.js or inspector-modules.js)
            .filter(runtimeChunk => !!runtimeChunk && runtimeChunk.preventIntegration)
            .map(runtimeChunk => runtimeChunk.files))
            // get only the unique files in case of "single" runtime (e.g. runtime.js)
            .filter((value, index, self) => self.indexOf(value) === index)
            // convert to absolute paths
            .map(fileName => join(basePath, fileName));
    } catch (e) {
        // breaking change in the Webpack API
        console.log("Warning: Unable to find Webpack runtime files.");
    }

    return runtimeOnlyFiles;
}
