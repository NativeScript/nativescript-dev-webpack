const { RawSource } = require("webpack-sources");
const { getPackageJson } = require("../projectHelpers");

exports.GenerateBundleStarterPlugin = (function() {
    function GenerateBundleStarterPlugin(bundles) {
        this.bundles = bundles;
        this.files = {};
    };

    GenerateBundleStarterPlugin.prototype.apply = function(compiler) {
        this.webpackContext = compiler.options.context;

        compiler.hooks.emit.tapAsync("GenerateBundleStarterPlugin", (compilation, cb) => {
            this.addAsset(compilation, "package.json", this.generatePackageJson());
            this.addAsset(compilation, "starter.js", this.generateStarterModule());
            this.generateTnsJavaClasses(compilation);

            cb();
        });
    }

    GenerateBundleStarterPlugin.prototype.generateTnsJavaClasses = function (compilation) {
        const path = compilation.compiler.outputPath;
        const isAndroid = path.indexOf("android") > -1;

        if (isAndroid && !compilation.assets["tns-java-classes.js"]) {
            this.addAsset(compilation, "tns-java-classes.js", "");
        }
    }

    GenerateBundleStarterPlugin.prototype.generatePackageJson = function () {
        const packageJson = getPackageJson(this.webpackContext);
        packageJson.main = "starter";

        return JSON.stringify(packageJson, null, 4);
    }

    GenerateBundleStarterPlugin.prototype.generateStarterModule = function () {
        const moduleSource = this.bundles
            .map(bundle => `require("${bundle}")`)
            .join("\n");

        return moduleSource;
    }

    GenerateBundleStarterPlugin.prototype.addAsset = function(compilation, name, content) {
        if (this.files[name] !== content) {
            this.files[name] = content;
            compilation.assets[name] = new RawSource(content);
        }
    }

    return GenerateBundleStarterPlugin;
})();
