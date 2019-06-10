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

            let emittedFiles = Object
                .keys(compilation.assets)
                .filter(assetKey => compilation.assets[assetKey].emitted);

            const webpackRuntimeFiles = getWebpackRuntimeOnlyFiles(compilation);
            const entryPointFiles = getEntryPointFiles(compilation);

            process.send && process.send(messages.compilationComplete, error => null);
            // Send emitted files so they can be LiveSynced if need be
            process.send && process.send({ emittedFiles, webpackRuntimeFiles, entryPointFiles }, error => null);
        });
    }
}

function getWebpackRuntimeOnlyFiles(compilation) {
    let runtimeOnlyFiles = [];
    try {
        runtimeOnlyFiles = [].concat(...Array.from<any>(compilation.entrypoints.values())
            .map(entrypoint => entrypoint.runtimeChunk)
            // filter embedded runtime chunks (e.g. part of bundle.js or inspector-modules.js)
            .filter(runtimeChunk => !!runtimeChunk && runtimeChunk.preventIntegration)
            .map(runtimeChunk => runtimeChunk.files))
            // get only the unique files in case of "single" runtime (e.g. runtime.js)
            .filter((value, index, self) => self.indexOf(value) === index);
    } catch (e) {
        // breaking change in the Webpack API
        console.log("Warning: Unable to find Webpack runtime files.");
    }

    return runtimeOnlyFiles;
}

function getEntryPointFiles(compilation) {
    const entryPointFiles = [];
    try {
       Array.from(compilation.entrypoints.values())
            .forEach((entrypoint: any) => {
                const entryChunk = entrypoint.chunks.find(chunk => chunk.name === entrypoint.options.name);
                if (entryChunk) {
                    entryChunk.files.forEach(fileName => {
                        if (fileName.indexOf("hot-update") === -1) {
                            entryPointFiles.push(fileName);
                        }
                    });
                }
            });
    } catch (e) {
        console.log("Warning: Unable to find Webpack entry point files.");
    }

    return entryPointFiles;
}