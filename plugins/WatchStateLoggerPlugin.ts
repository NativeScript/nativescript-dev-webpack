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

            const runtimeOnlyFiles = getWebpackRuntimeOnlyFiles(compilation, compiler);
            let emittedFiles = Object
                .keys(compilation.assets)
                .filter(assetKey => compilation.assets[assetKey].emitted);

            // provide fake paths to the {N} CLI - relative to the 'app' folder
            // in order to trigger the livesync process
            const emittedFilesFakePaths = emittedFiles
                .map(file => join(compiler.context, file));

            process.send && process.send(messages.compilationComplete, error => null);
            // Send emitted files so they can be LiveSynced if need be
            process.send && process.send({ emittedFiles: emittedFilesFakePaths, webpackRuntimeFiles: runtimeOnlyFiles }, error => null);
        });
    }
}

function getWebpackRuntimeOnlyFiles(compilation, compiler) {
    let runtimeOnlyFiles = [];
    try {
        runtimeOnlyFiles = [].concat(...compilation.chunkGroups
            // get the chunk group of each entry points (e.g. main.js and inspector-modules.js)
            .map(chunkGroup => chunkGroup.runtimeChunk)
            // filter embedded runtime chunks (e.g. part of bundle.js or inspector-modules.js)
            .filter(runtimeChunk => runtimeChunk.preventIntegration)
            .map(runtimeChunk => runtimeChunk.files))
            // get only the unique files in case of "single" runtime (e.g. runtime.js)
            .filter((value, index, self) => self.indexOf(value) === index)
            // convert to absolute paths
            .map(fileName => join(compiler.context, fileName));
    } catch (e) {
        // breaking change in the Webpack API
        console.log("Warning: Unable to find Webpack runtime files.");
    }

    return runtimeOnlyFiles;
}
