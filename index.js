var webpack = require("webpack");
var shelljs = require("shelljs");
var path = require("path");
var fs = require("fs");
var resolver = require("./resolver");

var tnsPackage = "tns-core-modules";
var tnsModulesDir = path.join("node_modules", tnsPackage);

var platformOutDir = process.env.PLATFORM_DIR;

exports.readPackageJson = resolver.readPackageJson;
exports.getPackageMain = resolver.getPackageMain;

exports.writePackageJson = function writePackageJson(dir, data) {
    var packageJson = path.join(dir, "package.json");
    fs.writeFileSync(packageJson, JSON.stringify(data, null, 4), 'utf8');
};

exports.getEntryPoint = function getEntryPoint(appDir) {
    var packageJson = exports.readPackageJson(appDir);
    var entryModule = null;
    if (packageJson.bundleMain) {
        entryModule = packageJson.bundleMain;
    } else {
        entryModule = path.join(appDir, exports.getPackageMain(appDir));
    }
    return "./" + entryModule;
};

exports.getBundleDestination = function getBundleDestination(appDir) {
    var packageJson = exports.readPackageJson(appDir);
    var bundleOutput = "bundle.js";
    if (packageJson.bundleOutput) {
        bundleOutput = packageJson.bundleOutput;
    }
    return path.join(platformOutDir, appDir, bundleOutput);
};

exports.getConfig = function getConfig(userDefined) {
    if (!userDefined.context) {
        userDefined.context = "./app";
    }
    if (!userDefined.entry) {
        userDefined.entry =  {
            app: exports.getEntryPoint("./app"),
        };
    }
    if (!userDefined.output) {
        userDefined.output = {
            pathinfo: true,
            libraryTarget: "commonjs2",
            filename: exports.getBundleDestination("./app"),
        };
    }
    if (!userDefined.resolve) {
        userDefined.resolve = {
            extensions: ["", ".js"],
            packageMains: ["main"],
        };
    }

    if (!userDefined.plugins) {
        userDefined.plugins = [];
    }
    if (!userDefined.resolverPlugins) {
        userDefined.resolverPlugins = [];
    }
    userDefined.plugins.push(
        new webpack.DefinePlugin({
            global: 'global',
            __dirname: '__dirname'
        })
    );
    var resolverPlugins = (userDefined.resolverPlugins || []).concat(resolver.TnsResolver);
    userDefined.plugins.push(new webpack.ResolverPlugin(resolverPlugins));
    return userDefined;
};
