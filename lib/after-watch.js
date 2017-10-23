var compiler = require('./compiler');
module.exports = function($logger) {
    var webpackProcess = compiler.getWebpackProcess();
    if (webpackProcess) {
        $logger.info("Stopping webpack watch");
        webpack.kill("SIGINT");
    }
}
