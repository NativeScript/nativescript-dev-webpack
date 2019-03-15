const { stopWebpackCompiler } = require('./compiler');
const { removeListener } = require("./utils");

module.exports = function($logger, $liveSyncService) {
    stopWebpackCompiler($logger);
    removeListener($liveSyncService, "liveSyncStopped");
    removeListener(process, "exit");
}
