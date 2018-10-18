const { stopWebpackCompiler } = require('./compiler');
const { removeListener } = require("./utils");

module.exports = function($logger, $liveSyncService) {
    $logger.info("Stopping webpack watch");
    stopWebpackCompiler();
    removeListener($liveSyncService, "liveSyncStopped");
    removeListener(process, "exit");
}
