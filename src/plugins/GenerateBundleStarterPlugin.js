const { RawSource } = require("webpack-sources");
const { getPackageJson } = require("../projectHelpers");

exports.GenerateBundleStarterPlugin = (function() {
    function GenerateBundleStarterPlugin(bundles) {
        this.bundles = bundles;
    };

    GenerateBundleStarterPlugin.prototype.apply = function(compiler) {
        const plugin = this;
        plugin.webpackContext = compiler.options.context;

        compiler.plugin("emit", function (compilation, cb) {
            compilation.assets["package.json"] = plugin.generatePackageJson();
            compilation.assets["starter.js"] = plugin.generateStarterModule();
            plugin.generateTnsJavaClasses(compilation);

            cb();
        });
    }

    GenerateBundleStarterPlugin.prototype.generateTnsJavaClasses = function (compilation) {
        const path = compilation.compiler.outputPath;
        const isAndroid = path.indexOf("android") > -1;

        if (isAndroid && !compilation.assets["tns-java-classes.js"]) {
            compilation.assets["tns-java-classes.js"] = new RawSource("");
        }
    }

    GenerateBundleStarterPlugin.prototype.generatePackageJson = function () {
        const packageJson = getPackageJson(this.webpackContext);
        packageJson.main = "starter";

        return new RawSource(JSON.stringify(packageJson, null, 4));
    }

    GenerateBundleStarterPlugin.prototype.generateStarterModule = function () {
        const moduleSource = this.bundles
            .map(bundle => `require("${bundle}")`)
            .join("\n");

        return new RawSource(moduleSource);
    }

    return GenerateBundleStarterPlugin;
})();
