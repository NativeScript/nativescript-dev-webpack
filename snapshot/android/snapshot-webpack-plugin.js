var path = require('path');
var shelljs = require("shelljs");
var ProjectSnapshotGenerator = require("./project-snapshot-generator");

function SnapshotWebpackPlugin(options) {
    ProjectSnapshotGenerator.call(this, options); // Call the parent constructor

    if (!this.options.chunk) {
        throw new Error("No chunk specified.");
    }

    if (this.options.webpackConfig.output && this.options.webpackConfig.output.libraryTarget) {
        this.options.webpackConfig.output.libraryTarget = undefined;
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

    // Remove the original bundle file
    if (inputFile != preprocessedInputFile) {
        shelljs.rm(inputFile);
    }

    // Copy tns-java-classes.js
    shelljs.cp(path.join(ProjectSnapshotGenerator.TOOLS_PATH, "tns-java-classes.js"), path.join(preparedAppRootPath, "app"));
}

SnapshotWebpackPlugin.prototype.apply = function(compiler) {
    var options = this.options;

    // compiler.plugin('emit', function(compilation, callback) {
    //     var chunkToSnapshot = compilation.chunks.find(function(chunk) { return chunk.name == options.chunk; });

    //     // Generate require-override map
    //     chunkToSnapshot.modules.forEach(function(module) {
            
    //     }.bind(this));

    //     callback();
    // });
    
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