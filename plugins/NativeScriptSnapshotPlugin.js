const { resolve, join } = require("path");
const { closeSync, openSync } = require("fs");

const ProjectSnapshotGenerator = require("../snapshot/android/project-snapshot-generator");

exports.NativeScriptSnapshotPlugin = (function() {
    function NativeScriptSnapshotPlugin(options) {
        ProjectSnapshotGenerator.call(this, options); // Call the parent constructor

        if (!this.options.chunk) {
            throw new Error("No chunk specified.");
        }

        console.dir()

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
    NativeScriptSnapshotPlugin.prototype = Object.create(ProjectSnapshotGenerator.prototype);
    NativeScriptSnapshotPlugin.prototype.constructor = NativeScriptSnapshotPlugin;

    NativeScriptSnapshotPlugin.prototype.getTnsJavaClassesBuildPath = function() {
        return resolve(this.getBuildPath(), "../tns-java-classes.js");
    }

    NativeScriptSnapshotPlugin.prototype.generate = function(webpackChunk) {
        const options = this.options;

        const inputFile = join(options.webpackConfig.output.path, webpackChunk.files[0]);

        console.log(`\n Snapshotting bundle at ${inputFile}`);

        const preparedAppRootPath = join(options.projectRoot, "platforms/android/src/main/assets");
        const preprocessedInputFile = join(preparedAppRootPath, "app/_embedded_script_.js");

        return ProjectSnapshotGenerator.prototype.generate.call(this, {
            inputFile,
            preprocessedInputFile,
            targetArchs: options.targetArchs,
            useLibs: options.useLibs,
            androidNdkPath: options.androidNdkPath,
            tnsJavaClassesPath: join(preparedAppRootPath, "app/tns-java-classes.js")
        }).then(() => {
            // Make the original file empty
            if (inputFile !== preprocessedInputFile) {
                closeSync(openSync(inputFile, "w")); // truncates the input file content
            }
        });
    }

    NativeScriptSnapshotPlugin.prototype.apply = function(compiler) {
        const options = this.options;

        // Generate tns-java-classes.js file
        debugger;
        ProjectSnapshotGenerator.prototype.generateTnsJavaClassesFile.call(this, {
            output: this.getTnsJavaClassesBuildPath(),
            options: options.tnsJavaClassesOptions
        });

        // Generate snapshots
        compiler.plugin("after-emit", function(compilation, callback) {
            debugger;
            const chunkToSnapshot = compilation.chunks.find(chunk => chunk.name == options.chunk);
            if (!chunkToSnapshot) {
                throw new Error(`No chunk named '${options.chunk}' found.`);
            }

            this.generate(chunkToSnapshot)
                .then(() => {
                    console.log("Successfully generated snapshots!");
                    callback();
                })
                .catch((error) => {
                    console.error("Snapshot generation failed with the following error:");
                    console.error(error);
                    callback();
                });

        }.bind(this));
    }

    return NativeScriptSnapshotPlugin;
})();
