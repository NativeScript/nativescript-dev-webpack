var path = require("path");
var shelljs = require("shelljs");

module.exports = function (logger, platformsData, projectData, hookArgs) {
    if (!process.env.TNS_WEBPACK) {
        console.log("Bundling disabled. Set the TNS_WEBPACK environment variable to enable it.");
        return;
    }

    var platform = hookArgs.platform.toLowerCase();
    process.env.PLATFORM = platform;

    var platformData = platformsData.getPlatformData(platform);
    var platformOutDir = platformData.appDestinationDirectoryPath;
    var platformAppDir = path.join(platformOutDir, "app");
    process.env.PLATFORM_DIR = platformOutDir;

    var bundler = require("nativescript-dev-webpack");

    return new Promise(function (resolve, reject) {
        return shelljs.exec("npm run webpack", function(code, output) {
            if (code === 0) {
                var appJson = bundler.readPackageJson(platformAppDir);
                var bundleRelativePath = path.relative(platformOutDir, bundler.getBundleDestination("./app"));
                appJson.main = path.basename(bundleRelativePath);
                bundler.writePackageJson(platformAppDir, appJson);

                resolve();
            } else {
                console.log('Webpack bundling failed.');
                reject();
            }
        });
    });
};
