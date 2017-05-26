var sources = require("webpack-sources");
var fs = require("fs");
var path = require("path");

var projectDir = path.dirname(path.dirname(__dirname));
var packageJsonPath = path.join(projectDir, "package.json");
var packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

var isAngular = Object.keys(packageJson.dependencies).filter(function (dependency) {
    return /^@angular\b/.test(dependency);
}).length > 0;


if (isAngular) {
    exports.UrlResolvePlugin = require("./resource-resolver-plugins/UrlResolvePlugin");
}

//HACK: changes the JSONP chunk eval function to `global["nativescriptJsonp"]`
// applied to tns-java-classes.js only
exports.NativeScriptJsonpPlugin = function () {
};

exports.NativeScriptJsonpPlugin.prototype.apply = function (compiler) {
    compiler.plugin("compilation", function (compilation) {
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

exports.GenerateBundleStarterPlugin = function (bundles) {
    this.bundles = bundles;
};

exports.GenerateBundleStarterPlugin.prototype = {
    apply: function (compiler) {
        var plugin = this;
        plugin.webpackContext = compiler.options.context;

        compiler.plugin("emit", function (compilation, cb) {
            compilation.assets["package.json"] = plugin.generatePackageJson();
            compilation.assets["starter.js"] = plugin.generateStarterModule();
            plugin.generateTnsJavaClasses(compilation);

            cb();
        });
    },
    generateTnsJavaClasses: function (compilation) {
        const path = compilation.compiler.outputPath;
        const isAndroid = path.indexOf("android") > -1;

        if (isAndroid) {
            compilation.assets["tns-java-classes.js"] = new sources.RawSource("");
        }
    },
    generatePackageJson: function () {
        var packageJsonPath = path.join(this.webpackContext, "package.json");
        var packageData = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
        packageData.main = "starter";

        return new sources.RawSource(JSON.stringify(packageData, null, 4));
    },
    generateStarterModule: function () {
        var moduleSource = this.bundles.map(function (bundle) {
            return "require(\"" + bundle + "\");";
        }).join("\n");
        return new sources.RawSource(moduleSource);
    },
};

exports.getEntryModule = function () {
    const maybePackageJsonEntry = getPackageJsonEntry();
    if (!maybePackageJsonEntry) {
        throw new Error("app/package.json must contain a `main` attribute.");
    }

    const maybeAotEntry = getAotEntry(maybePackageJsonEntry);
    return maybeAotEntry || maybePackageJsonEntry;
};

exports.getAppPath = function (platform) {
    var projectDir = path.dirname(path.dirname(__dirname));

    if (/ios/i.test(platform)) {
        var appName = path.basename(projectDir);
        var sanitizedName = appName.split("").filter(function (c) {
            return /[a-zA-Z0-9]/.test(c);
        }).join("");
        return "platforms/ios/" + sanitizedName + "/app";
    } else if (/android/i.test(platform)) {
        return path.join(projectDir, "platforms/android/src/main/assets/app");
    } else {
        throw new Error("Invalid platform: " + platform);
    }
};

exports.uglifyMangleExcludes = require("./mangle-excludes");

function getPackageJsonEntry() {
    const packageJsonSource = getAppPackageJsonSource();
    const entry = packageJsonSource.main;

    return entry ? entry.replace(/\.js$/i, "") : null;
}

function getAppPackageJsonSource() {
    const projectDir = getProjectDir();
    const appPackageJsonPath = path.join(projectDir, "app", "package.json");

    return JSON.parse(fs.readFileSync(appPackageJsonPath, "utf8"));
}

function getAotEntry(entry) {
    const aotEntry = `${entry}.aot.ts`;
    const projectDir = getProjectDir();
    const aotEntryPath = path.join(projectDir, "app", aotEntry);

    return fs.existsSync(aotEntryPath) ? aotEntry : null;
}

function getProjectDir() {
    return path.dirname(path.dirname(__dirname));
}
