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

        if (this.options.webpackConfig.entry) {
            if (typeof this.options.webpackConfig.entry === "string" ||
                this.options.webpackConfig.entry instanceof Array)
                this.options.webpackConfig.entry = { bundle: this.options.webpackConfig.entry };
        }

        this.options.webpackConfig.entry["tns-java-classes"] = this.getTnsJavaClassesBuildPath();
    }
}

// inherit ProjectSnapshotGenerator
SnapshotWebpackPlugin.prototype = Object.create(ProjectSnapshotGenerator.prototype);
SnapshotWebpackPlugin.prototype.constructor = SnapshotWebpackPlugin;

module.exports = SnapshotWebpackPlugin;

SnapshotWebpackPlugin.prototype.generate = function(webpackChunk) {
    var options = this.options;

    var inputFile = path.join(options.webpackConfig.output.path, webpackChunk.files[0]);

    console.log("\n Snapshotting bundle at " + inputFile);

    var preparedAppRootPath = path.join(options.projectRoot, "platforms/android/src/main/assets");
    var preprocessedInputFile = path.join(preparedAppRootPath, "app/_embedded_script_.js");

    ProjectSnapshotGenerator.prototype.generate.call(this, {
        inputFile: inputFile,
        targetArchs: options.targetArchs,
        preprocessedInputFile: preprocessedInputFile,
        useLibs: options.useLibs,
        androidNdkPath: options.androidNdkPath,
        tnsJavaClassesPath: this.getTnsJavaClassesBuildPath()
    });

    // Make the original file empty
    if (inputFile != preprocessedInputFile) {
        fs.closeSync(fs.openSync(inputFile, 'w')); // truncates the input file content
    }
}

SnapshotWebpackPlugin.prototype.apply = function(compiler) {
    var options = this.options;

    // Generate tns-java-classes.js file
    debugger;
    ProjectSnapshotGenerator.prototype.cleanBuildFolder.call(this);
    ProjectSnapshotGenerator.prototype.generateTnsJavaClassesFile.call(this, { output: this.getTnsJavaClassesBuildPath(), options: options.tnsJavaClassesOptions });
    
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