import { join } from "path";
import { writeFileSync, readFileSync } from "fs";

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

            const emittedFiles = Object
                .keys(compilation.assets)
                .filter(assetKey => compilation.assets[assetKey].emitted);

            if (compilation.errors.length > 0) {
                WatchStateLoggerPlugin.rewriteHotUpdateChunk(compiler, compilation, emittedFiles);
            }

            // provide fake paths to the {N} CLI - relative to the 'app' folder
            // in order to trigger the livesync process
            const emittedFilesFakePaths = emittedFiles
                .map(file => join(compiler.context, file));

            process.send && process.send(messages.compilationComplete, error => null);
            // Send emitted files so they can be LiveSynced if need be
            process.send && process.send({ emittedFiles: emittedFilesFakePaths }, error => null);
        });
    }

    /**
     * Rewrite an errored chunk to make the hot module replace successful.
     * @param compiler the webpack compiler
     * @param emittedFiles the emitted files from the current compilation
     */
    private static rewriteHotUpdateChunk(compiler, compilation, emittedFiles: string[]) {
        const chunk = this.findHotUpdateChunk(emittedFiles);
        if (!chunk) {
            return;
        }

        const { name } = this.parseHotUpdateChunkName(chunk);
        if (!name) {
            return;
        }

        const absolutePath = join(compiler.outputPath, chunk);

        const newContent = this.getWebpackHotUpdateReplacementContent(compilation.errors, absolutePath, name);
        writeFileSync(absolutePath, newContent);
    }

    private static findHotUpdateChunk(emittedFiles: string[]) {
        return emittedFiles.find(file => file.endsWith("hot-update.js"));
    }

    /**
     * Gets only the modules object after 'webpackHotUpdate("bundle",' in the chunk
     */
    private static getModulesObjectFromChunk(chunkPath) {
        let content = readFileSync(chunkPath, "utf8")
        const startIndex = content.indexOf(",") + 1;
        let endIndex = content.length - 1;
        if(content.endsWith(';')) {
            endIndex--;
        }
        return content.substring(startIndex, endIndex);
    }

    /**
     * Gets the webpackHotUpdate call with updated modules not to include the ones with errors
     */
    private static getWebpackHotUpdateReplacementContent(compilationErrors, filePath, moduleName) {
        const errorModuleIds = compilationErrors.filter(x => x.module).map(x => x.module.id);
        if (!errorModuleIds || errorModuleIds.length == 0) {
            // could not determine error modiles so discard everything
            return `webpackHotUpdate('${moduleName}', {});`;
        }
        const updatedModules = this.getModulesObjectFromChunk(filePath);

        // we need to filter the modules with a function in the file as it is a relaxed JSON not valid to be parsed and manipulated
        return `const filter = function(updatedModules, modules) {
            modules.forEach(moduleId => delete updatedModules[moduleId]);
            return updatedModules;
        }
        webpackHotUpdate('${moduleName}', filter(${updatedModules}, ${JSON.stringify(errorModuleIds)}));`;
    }

    /**
     * Parse the filename of the hot update chunk.
     * @param name bundle.deccb264c01d6d42416c.hot-update.js
     * @returns { name: string, hash: string } { name: 'bundle', hash: 'deccb264c01d6d42416c' }
     */
    private static parseHotUpdateChunkName(name) {
        const matcher = /^(.+)\.(.+)\.hot-update/gm;
        const matches = matcher.exec(name);

        return {
            name: matches[1] || "",
            hash: matches[2] || "",
        };
    }
}
