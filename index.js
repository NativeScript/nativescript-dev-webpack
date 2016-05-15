var webpack = require("webpack");
var shelljs = require("shelljs");
var path = require("path");
var fs = require("fs");
var resolver = require("./resolver");

var tnsPackage = "tns-core-modules";
var tnsModulesDir = path.join("node_modules", tnsPackage);

var platform = process.env.PLATFORM;
var platformOutDir = process.env.PLATFORM_DIR;

exports.readPackageJson = resolver.readPackageJson;
exports.getPackageMain = resolver.getPackageMain;

exports.writePackageJson = function writePackageJson(dir, data) {
    var packageJson = path.join(dir, "package.json");
    fs.writeFileSync(packageJson, JSON.stringify(data, null, 4), 'utf8');
};

function endWithJs(fileName) {
    if (/\.js$/i.test(fileName)) {
        return fileName;
    } else {
        return fileName + ".js";
    }
}

exports.getEntryPoint = function getEntryPoint(appDir) {
    var packageJson = exports.readPackageJson(appDir);
    var entryModule = null;
    if (packageJson.bundleMain) {
        entryModule = endWithJs(packageJson.bundleMain);
    } else {
        entryModule = exports.getPackageMain(appDir);
    }

    // Strip leading dir name and return just the submodule.
    return entryModule.replace(/^[^\\\/]+[\\\/]/, "./");
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
    var platformOutDir = process.env.PLATFORM_DIR;
    var appOutDir = path.join(platformOutDir, "app");

    if (!userDefined.context) {
        userDefined.context = "./app";
    }
    if (!userDefined.entry) {
        userDefined.entry = {
            "bundle": exports.getEntryPoint("./app"),
        };
        if (platform === "android") {
            userDefined.entry["tns-java-classes"] = "./tns-java-classes";
        }
    }
    if (!userDefined.output) {
        userDefined.output = {
            pathinfo: true,
            path: appOutDir,
            libraryTarget: "commonjs2",
            filename: "[name].js",
            jsonpFunction: "nativescriptJsonp",
        };
    }
    if (!userDefined.resolve) {
        userDefined.resolve = {
            extensions: ["", ".js", "." + platform + ".js"],
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
            __dirname: '__dirname',
            "global.TNS_WEBPACK": 'true',
        })
    );
    if (platform === "android") {
        userDefined.plugins.push(new webpack.optimize.CommonsChunkPlugin(
            "tns-java-classes", "tns-java-classes.js", Infinity));
    }

    var resolverPlugins = (userDefined.resolverPlugins || []).concat(resolver.TnsResolver);
    userDefined.plugins.push(new webpack.ResolverPlugin(resolverPlugins));
    return userDefined;
};
