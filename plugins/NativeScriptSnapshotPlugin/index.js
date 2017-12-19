const { resolve, join } = require("path");
const { closeSync, openSync } = require("fs");
const validateOptions = require("schema-utils");

const ProjectSnapshotGenerator = require("../../snapshot/android/project-snapshot-generator");
const { resolveAndroidAppPath } = require("../../projectHelpers");
const schema = require("./options.json");

exports.NativeScriptSnapshotPlugin = (function() {
    function NativeScriptSnapshotPlugin(options) {
        NativeScriptSnapshotPlugin.validateSchema(options);

        ProjectSnapshotGenerator.call(this, options); // Call the parent constructor

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

    NativeScriptSnapshotPlugin.validateSchema = function(options) {
        if (!options.chunk) {
            const error = NativeScriptSnapshotPlugin.extendError({ message: `No chunk specified!` });
            throw error;
        }

        try {
            validateOptions(schema, options, "NativeScriptSnapshotPlugin");
        } catch (error) {
           throw new Error(error.message);
        }
    }

    // inherit ProjectSnapshotGenerator
    NativeScriptSnapshotPlugin.prototype = Object.create(ProjectSnapshotGenerator.prototype);
    NativeScriptSnapshotPlugin.prototype.constructor = NativeScriptSnapshotPlugin;

    NativeScriptSnapshotPlugin.prototype.getTnsJavaClassesBuildPath = function () {
        return resolve(this.getBuildPath(), "../tns-java-classes.js");
    }

    NativeScriptSnapshotPlugin.prototype.generate = function (webpackChunk) {
        const options = this.options;

        const inputFile = join(options.webpackConfig.output.path, webpackChunk.files[0]);

        console.log(`\n Snapshotting bundle at ${inputFile}`);

        const preparedAppRootPath = resolveAndroidAppPath(this.options.projectRoot);
        const preprocessedInputFile = join(preparedAppRootPath, "_embedded_script_.js");

        return ProjectSnapshotGenerator.prototype.generate.call(this, {
            inputFile,
            preprocessedInputFile,
            targetArchs: options.targetArchs,
            useLibs: options.useLibs,
            androidNdkPath: options.androidNdkPath,
            tnsJavaClassesPath: join(preparedAppRootPath, "tns-java-classes.js")
        }).then(() => {
            // Make the original file empty
            if (inputFile !== preprocessedInputFile) {
                closeSync(openSync(inputFile, "w")); // truncates the input file content
            }
        });
    }

    NativeScriptSnapshotPlugin.prototype.apply = function (compiler) {
        const options = this.options;

        // Generate tns-java-classes.js file
        debugger;
        ProjectSnapshotGenerator.prototype.generateTnsJavaClassesFile.call(this, {
            output: this.getTnsJavaClassesBuildPath(),
            options: options.tnsJavaClassesOptions
        });

        // Generate snapshots
        compiler.plugin("after-emit", function (compilation, callback) {
            debugger;
            const chunkToSnapshot = compilation.chunks.find(chunk => chunk.name == options.chunk);
            if (!chunkToSnapshot) {
                const error = NativeScriptSnapshotPlugin.extendError({ message: `No chunk named '${options.chunk}' found.` });
                compilation.errors.push(error);
                return callback();
            }

            this.generate(chunkToSnapshot)
                .then(() => {
                    console.log("Successfully generated snapshots!");
                    return callback();
                })
                .catch((error) => {
                    const extendedError = NativeScriptSnapshotPlugin.extendError({ originalError: error });
                    compilation.errors.push(extendedError);
                    return callback();
                });
        }.bind(this));
    }

    NativeScriptSnapshotPlugin.extendError = function ({ originalError, message } = {}) {
        const header = `NativeScriptSnapshot. Snapshot generation failed!\n`;
        if (originalError) {
            originalError.message = `${header}${originalError.message}`;
            return originalError;
        }

        const newMessage = message ? `${header}${message}` : header;
        return new Error(newMessage);
    };

    return NativeScriptSnapshotPlugin;
})();
