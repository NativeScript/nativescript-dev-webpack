"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var messages;
(function (messages) {
    messages["compilationComplete"] = "Webpack compilation complete.";
    messages["startWatching"] = "Webpack compilation complete. Watching for file changes.";
    messages["changeDetected"] = "File change detected. Starting incremental webpack compilation...";
})(messages = exports.messages || (exports.messages = {}));
/**
 * This little plugin will report the webpack state through the console.
 * So the {N} CLI can get some idea when compilation completes.
 */
class WatchStateLoggerPlugin {
    apply(compiler) {
        const plugin = this;
        compiler.plugin("watch-run", function (compiler, callback) {
            plugin.isRunningWatching = true;
            if (plugin.isRunningWatching) {
                console.log(messages.changeDetected);
            }
            process.send && process.send(messages.changeDetected, error => null);
            callback();
        });
        compiler.plugin("after-emit", function (compilation, callback) {
            callback();
            if (plugin.isRunningWatching) {
                console.log(messages.startWatching);
            }
            else {
                console.log(messages.compilationComplete);
            }
            process.send && process.send(messages.compilationComplete, error => null);
        });
    }
}
exports.WatchStateLoggerPlugin = WatchStateLoggerPlugin;
//# sourceMappingURL=WatchStateLoggerPlugin.js.map