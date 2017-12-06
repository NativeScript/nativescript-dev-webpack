
export enum messages {
    compilationComplete = "Webpack compilation complete. Watching for file changes.",
    changeDetected = "File change detected. Starting incremental webpack compilation..."
}

/**
 * This little plugin will report the webpack state through the console.
 * So the {N} CLI can get some idea when compilation completes.
 */
export class WatchStateLoggerPlugin {
    apply(compiler) {
        compiler.plugin("watch-run", function(compiler, callback) {
            console.log(messages.changeDetected);
            process.send && process.send(messages.changeDetected, error => null);
            callback();
        });
        compiler.plugin("after-emit", function(compilation, callback) {
            callback();
            console.log(messages.compilationComplete);
            process.send && process.send(messages.compilationComplete, error => null);
        });
    }
}
