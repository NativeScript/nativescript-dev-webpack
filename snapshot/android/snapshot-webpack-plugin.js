var path = require('path');
var fs = require('fs');
var shelljs = require("shelljs");
var ProjectSnapshotGenerator = require("./project-snapshot-generator");

function SnapshotWebpackPlugin(options) {
    ProjectSnapshotGenerator.call(this, options); // Call the parent constructor

    if (!this.options.chunk) {
        throw new Error("No chunk specified.");
    }

    if (this.options.webpackConfig) {
        if (this.options.webpackConfig.output && this.options.webpackConfig.output.libraryTarget) {
            this.options.webpackConfig.output.libraryTarget = undefined;
        }

        // TODO: Consider extracting this in a separate plugin
        if (this.options.webpackConfig.entry) {
            if (typeof this.options.webpackConfig.entry === "string" ||
                this.options.webpackConfig.entry instanceof Array)
                this.options.webpackConfig.entry = { bundle: this.options.webpackConfig.entry };
        }
        
        var projectRoot = this.options.projectRoot;
        var node_modules_path = path.join(projectRoot, "node_modules");
        var modules = fs.readdirSync(node_modules_path);
        var earlyModules = [];
        for(var i = 0; i < modules.length; i++) {
            var earlyExecutedModule = path.join(node_modules_path, modules[i], "__snapshot/android/early_executed_module.js");
            if (fs.existsSync(earlyExecutedModule)) {
                earlyModules.push(earlyExecutedModule);
            }
        }

        if (earlyModules.length > 0)
            this.options.webpackConfig.entry["tns-java-classes"] = earlyModules;
    }
}

// inherit SingleFileSnapshotGenerator
SnapshotWebpackPlugin.prototype = Object.create(ProjectSnapshotGenerator.prototype);
SnapshotWebpackPlugin.prototype.constructor = SnapshotWebpackPlugin;

module.exports = SnapshotWebpackPlugin;

SnapshotWebpackPlugin.prototype.generate = function(webpackChunk) {
    var options = this.options;

    var inputFile = path.join(options.webpackConfig.output.path, webpackChunk.files[0]);

    console.log("\n Snapshotting bundle at " + inputFile);

    var preparedAppRootPath = path.join(options.projectRoot, "platforms/android/src/main/assets");
    var preprocessedInputFile = path.join(preparedAppRootPath, "app/_embedded_script_.js");

    var generatorBuildPath = ProjectSnapshotGenerator.prototype.generate.call(this, {
        inputFile: inputFile,
        targetArchs: options.targetArchs,
        preprocessedInputFile: preprocessedInputFile,
        useLibs: options.useLibs,
        androidNdkPath: options.androidNdkPath
    });

    // Make the original file empty
    if (inputFile != preprocessedInputFile) {
        fs.closeSync(fs.openSync(inputFile, 'w')); // truncates the input file content
    }
}

SnapshotWebpackPlugin.prototype.apply = function(compiler) {
    var options = this.options;

    
    // Run the snapshot tool when the packing is done
    compiler.plugin('done', function(result) {
        debugger;
        var chunkToSnapshot = result.compilation.chunks.find(function(chunk) { return chunk.name == options.chunk; });
        if (!chunkToSnapshot) {
            throw new Error("No chunk named '" + options.chunk + "' found.");
        }

        this.generate(chunkToSnapshot);

    }.bind(this));
}