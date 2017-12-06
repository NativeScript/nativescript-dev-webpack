const compiler = require('./compiler');
module.exports = function($logger) {
    const webpackProcess = compiler.getWebpackProcess();
    if (webpackProcess) {
        $logger.info("Stopping webpack watch");
        webpack.kill("SIGINT");
    }
}
