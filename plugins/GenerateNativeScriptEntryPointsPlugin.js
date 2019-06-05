const { RawSource } = require("webpack-sources");
const { getPackageJson } = require("../projectHelpers");
const { SNAPSHOT_ENTRY_NAME } = require("./NativeScriptSnapshotPlugin");


exports.GenerateNativeScriptEntryPointsPlugin = (function () {
    const GenerationFailedError = "Unable to generate entry files.";

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
        const entryPointName = entryPoint.options.name;
        let entryChunk;
        if (entryPointName === SNAPSHOT_ENTRY_NAME) {
            // Do not require the snapshot entry dependencies as the snapshot will fail.
            return;
        }

        const requireDeps =
            entryPoint.chunks.map(chunk => {
                let requireChunkFiles = "";
                if (chunk.name === entryPointName) {
                    entryChunk = chunk;
                } else {
                    chunk.files.forEach(fileName => {
                        if (!this.isHMRFile(fileName)) {
                            requireChunkFiles += `require("./${fileName}");`;
                        }
                    });
                }

                return requireChunkFiles;
            }).join("");

        if (!entryChunk) {
            throw new Error(`${GenerationFailedError} Entry chunk not found for entry "${entryPointName}".`);
        }

        entryChunk.files.forEach(fileName => {
            if (!compilation.assets[fileName]) {
                throw new Error(`${GenerationFailedError} File "${fileName}" not found for entry "${entryPointName}".`);
            }

            if (!this.isHMRFile(fileName)) {
                const currentEntryFileContent = compilation.assets[fileName].source();
                compilation.assets[fileName] = new RawSource(`${requireDeps}${currentEntryFileContent}`);
            }
        });
    }

    GenerateNativeScriptEntryPointsPlugin.prototype.addAsset = function (compilation, name, content) {
        if (this.files[name] !== content) {
            this.files[name] = content;
            compilation.assets[name] = new RawSource(content);
        }
    }

    GenerateNativeScriptEntryPointsPlugin.prototype.isHMRFile = function (fileName) {
        return fileName.indexOf("hot-update") > -1;
    }

    return GenerateNativeScriptEntryPointsPlugin;
})();
