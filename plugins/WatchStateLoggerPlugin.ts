
/**
 * This little plugin will report the webpack state through the console.
 * So the {N} CLI can get some idea when compilation completes.
 */
export class WatchStateLoggerPlugin {
    apply(compiler) {
        compiler.plugin("watch-run", function(compiler, callback) {
            console.log("File change detected. Starting incremental webpack compilation...");
            process.send && process.send("File change detected. Starting incremental webpack compilation...", error => null);
            callback();
        });
        compiler.plugin("after-emit", function(compilation, callback) {
            callback();
            console.log("Webpack compilation complete. Watching for file changes.");
            process.send && process.send("Webpack compilation complete. Watching for file changes.", error => null);
        });
    }
}
