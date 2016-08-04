var webpack = require("webpack");
var ConcatSource = require("webpack/lib/ConcatSource");
var shelljs = require("shelljs");
var path = require("path");
var fs = require("fs");

var tnsPackage = "tns-core-modules";
var tnsModulesDir = path.join("node_modules", tnsPackage);

var platform = process.env.PLATFORM;
var platformOutDir = process.env.PLATFORM_DIR;

exports.readPackageJson = function(dir) {
    var packageJson = path.join(dir, "package.json");
    if (shelljs.test("-f", packageJson)) {
        return JSON.parse(shelljs.cat(packageJson));
    } else {
        return {};
    }
};

exports.getPackageMain = function(packageDir) {
    if (shelljs.test("-f", packageDir + ".js")) {
        return packageDir + ".js";
    }

    var data = exports.readPackageJson(packageDir);
    if (data.main) {
        var main = data.main;
        if (/\.js$/i.test(main)) {
            return path.join(packageDir, main);
        } else {
            return path.join(packageDir, main + ".js");
        }
    } else {
        var indexPath = path.join(packageDir, "index.js");
        if (shelljs.test("-f", indexPath)) {
            return path.join(packageDir, "index.js");
        } else {
            throw new Error("Main module not found for: " + packageDir);
        }
    }
};

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

//HACK: changes the JSONP chunk eval function to `global["nativescriptJsonp"]`
// applied to tns-java-classes.js only
function FixJsonpPlugin(options) {
}

FixJsonpPlugin.prototype.apply = function(compiler) {
    compiler.plugin('compilation', function(compilation, params) {
        compilation.plugin("optimize-chunk-assets", function(chunks, callback) {
            chunks.forEach(function(chunk) {
                chunk.files.forEach(function(file) {
                    if (file === "tns-java-classes.js") {
                        var src = compilation.assets[file];
                        var code = src.source();
                        var match = code.match(/window\["nativescriptJsonp"\]/);
                        if (match) {
                            compilation.assets[file] = new ConcatSource(code.replace(/window\["nativescriptJsonp"\]/g,  "global[\"nativescriptJsonp\"]"));
                        }
                    }
                });
            });
            callback();
        });
    });
};


exports.getConfig = function getConfig(userDefined) {
    var platformOutDir = process.env.PLATFORM_DIR;
    var appOutDir = path.join(platformOutDir, "app");

    if (!userDefined.context) {
        userDefined.context = path.resolve("./app");
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
        userDefined.resolve = {};
    }
    if (!userDefined.resolve.extensions) {
        userDefined.resolve.extensions = [];
    }
    userDefined.resolve.extensions.push("");
    userDefined.resolve.extensions.push(".js");
    userDefined.resolve.extensions.push("." + platform + ".js");

    if (!userDefined.resolve.modulesDirectories) {
        userDefined.resolve.modulesDirectories = [];
    }
    userDefined.resolve.modulesDirectories.push("node_modules/tns-core-modules");
    userDefined.resolve.modulesDirectories.push("node_modules");

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

    userDefined.plugins.push(new FixJsonpPlugin());

    return userDefined;
};
