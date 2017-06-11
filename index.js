const sources = require("webpack-sources");
const fs = require("fs");
const path = require("path");

const { isAngular, getPackageJson } = require("./projectHelpers");

const PROJECT_DIR = path.dirname(path.dirname(__dirname));
const APP_DIR = path.join(PROJECT_DIR, "app");

if (isAngular(PROJECT_DIR)) {
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
                        const src = compilation.assets[file];
                        const code = src.source();
                        const match = code.match(/window\["nativescriptJsonp"\]/);
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
        const plugin = this;
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

        if (isAndroid && !compilation.assets["tns-java-classes.js"]) {
            compilation.assets["tns-java-classes.js"] = new sources.RawSource("");
        }
    },
    generatePackageJson: function () {
        const packageJson = getPackageJson(this.webpackContext);
        packageJson.main = "starter";

        return new sources.RawSource(JSON.stringify(packageJson, null, 4));
    },
    generateStarterModule: function () {
        const moduleSource = this.bundles
            .map(bundle => `require("${bundle}")`)
            .join("\n");

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

exports.getAppPath = platform => {
    var projectDir = path.dirname(path.dirname(__dirname));

    if (/ios/i.test(platform)) {
        const appName = path.basename(PROJECT_DIR);
        const sanitizedName = sanitize(appName);

        return `platforms/ios/${sanitizedName}/app`;
    } else if (/android/i.test(platform)) {
        return path.join(PROJECT_DIR, "platforms/android/src/main/assets/app");
    } else {
        throw new Error(`Invalid platform: ${platform}`);
    }
};

exports.uglifyMangleExcludes = require("./mangle-excludes");

function getPackageJsonEntry() {
    const packageJsonSource = getPackageJson(APP_DIR);
    const entry = packageJsonSource.main;

    return entry ? entry.replace(/\.js$/i, "") : null;
}

function getAotEntry(entry) {
    const aotEntry = `${entry}.aot.ts`;
    const aotEntryPath = path.join(APP_DIR, aotEntry);

    return fs.existsSync(aotEntryPath) ? aotEntry : null;
}

