const { stopWebpackCompiler } = require('./compiler');

module.exports = function($logger) {
    $logger.info("Stopping webpack watch");
    stopWebpackCompiler();
}
