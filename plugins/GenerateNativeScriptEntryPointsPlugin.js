const { RawSource } = require("webpack-sources");
const { getPackageJson } = require("../projectHelpers");
const { SNAPSHOT_ENTRY_MODULE } = require("./NativeScriptSnapshotPlugin");

exports.GenerateNativeScriptEntryPointsPlugin = (function () {
    function GenerateNativeScriptEntryPointsPlugin(appEntryName) {
        this.appEntryName = appEntryName;
        this.files = {};
    };

    GenerateNativeScriptEntryPointsPlugin.prototype.apply = function (compiler) {
        this.webpackContext = compiler.options.context;

        compiler.hooks.emit.tapAsync("GenerateNativeScriptEntryPointsPlugin", (compilation, cb) => {
            compilation.entrypoints.forEach(entryPoint => {
                this.generateEntryFile(compilation, entryPoint);
            });
            this.addAsset(compilation, "package.json", this.generatePackageJson());
            this.generateTnsJavaClasses(compilation);

            cb();
        });
    }

    GenerateNativeScriptEntryPointsPlugin.prototype.generateTnsJavaClasses = function (compilation) {
        const path = compilation.compiler.outputPath;
        const isAndroid = path.indexOf("android") > -1;

        if (isAndroid && !compilation.assets["tns-java-classes.js"]) {
            this.addAsset(compilation, "tns-java-classes.js", ""); 0
        }
    }

    GenerateNativeScriptEntryPointsPlugin.prototype.generatePackageJson = function () {
        const packageJson = getPackageJson(this.webpackContext);
        packageJson.main = this.appEntryName;

        return JSON.stringify(packageJson, null, 4);
    }

    GenerateNativeScriptEntryPointsPlugin.prototype.generateEntryFile = function (compilation, entryPoint) {
        const entryPointFileName = `${entryPoint.options.name}.js`;
        if (entryPointFileName === SNAPSHOT_ENTRY_MODULE) {
            // Do not require the snapshot entry dependencies as the snapshot will fail.
            return;
        }

        const requireDeps =
            entryPoint.chunks.map(chunk => {
                let requireChunkFiles = "";
                chunk.files.forEach(fileName => {
                    if (fileName !== entryPointFileName) {
                        requireChunkFiles += `require("./${fileName}");`;
                    }
                });

                return requireChunkFiles;
            }).join("\n");

        const currentEntryPointContent = compilation.assets[entryPointFileName].source();
        compilation.assets[entryPointFileName] = new RawSource(`${requireDeps}${currentEntryPointContent}`);
    }

    GenerateNativeScriptEntryPointsPlugin.prototype.addAsset = function (compilation, name, content) {
        if (this.files[name] !== content) {
            this.files[name] = content;
            compilation.assets[name] = new RawSource(content);
        }
    }

    return GenerateNativeScriptEntryPointsPlugin;
})();
