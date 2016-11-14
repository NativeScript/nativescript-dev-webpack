var sources = require("webpack-sources");
var fs = require("fs");
var path = require("path");

//HACK: changes the JSONP chunk eval function to `global["nativescriptJsonp"]`
// applied to tns-java-classes.js only
exports.NativeScriptJsonpPlugin = function(options) {
}

exports.NativeScriptJsonpPlugin.prototype.apply = function (compiler) {
    compiler.plugin('compilation', function (compilation, params) {
        compilation.plugin("optimize-chunk-assets", function (chunks, callback) {
            chunks.forEach(function (chunk) {
                chunk.files.forEach(function (file) {
                    if (file === "vendor.js") {
                        var src = compilation.assets[file];
                        var code = src.source();
                        var match = code.match(/window\["nativescriptJsonp"\]/);
                        if (match) {
                            compilation.assets[file] = new sources.ConcatSource(code.replace(/window\["nativescriptJsonp"\]/g, "global[\"nativescriptJsonp\"]"));
                        }
                    }
                });
            });
            callback();
        });
    });
};

exports.GenerateBundleStarterPlugin = function(bundles) {
    this.bundles = bundles;
}

exports.GenerateBundleStarterPlugin.prototype = {
    apply: function (compiler) {
        var plugin = this;
        plugin.webpackContext = compiler.options.context;

        compiler.plugin('emit', function (compilation, cb) {
            console.log(" GenerateBundleStarterPlugin: " + plugin.webpackContext);

            compilation.assets["package.json"] = plugin.generatePackageJson();
            compilation.assets["starter.js"] = plugin.generateStarterModule();

            cb();
        });
    },
    generatePackageJson: function() {
        var packageJsonPath = path.join(this.webpackContext, "package.json");
        var packageData = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
        packageData.main = "starter";

        return new sources.RawSource(JSON.stringify(packageData, null, 4));
    },
    generateStarterModule: function() {
        var moduleSource = this.bundles.map(function(bundle) {
            return "require(\"" + bundle + "\");";
        }).join("\n");
        return new sources.RawSource(moduleSource);
    },
};

exports.getEntryModule = function() {
    var projectDir = path.dirname(path.dirname(__dirname));
    var appPackageJsonPath = path.join(projectDir, "app", "package.json");
    var appPackageJson = JSON.parse(fs.readFileSync(appPackageJsonPath, "utf8"));
    if (!appPackageJson.main) {
        throw new Error("app/package.json must contain a `main` attribute.");
    }
    return appPackageJson.main.replace(/\.js$/i, "");
}

exports.getAppPath = function(platform) {
    var projectDir = path.dirname(path.dirname(__dirname));

    if (/ios/i.test(platform)) {
        var packageJson = JSON.parse(fs.readFileSync(path.join(projectDir, "package.json"), "utf8"));
        var appName = packageJson.nativescript.id.replace(/.*\.([^.]+)$/, "$1");
        return "platforms/ios/" + appName + "/app";
    } else if (/android/i.test(platform)) {
        return path.join(projectDir, "platforms/android/src/main/assets/app");
    } else {
        throw new Error("Invalid platform: " + platform);
    }
}
