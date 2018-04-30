const { relative, resolve, join } = require("path");
const { closeSync, openSync, writeFileSync } = require("fs");
const validateOptions = require("schema-utils");

const ProjectSnapshotGenerator = require("../../snapshot/android/project-snapshot-generator");
const { resolveAndroidAppPath, getAndroidProjectPath } = require("../../projectHelpers");
const schema = require("./options.json");

const SNAPSHOT_ENTRY_NAME = "snapshot-entry";
const SNAPSHOT_ENTRY_MODULE = `${SNAPSHOT_ENTRY_NAME}.js`;

exports.NativeScriptSnapshotPlugin = (function() {
    function NativeScriptSnapshotPlugin(options) {
        NativeScriptSnapshotPlugin.validateSchema(options);

        ProjectSnapshotGenerator.call(this, options);

        const { webpackConfig } = this.options;
        NativeScriptSnapshotPlugin.removeLibraryTarget(webpackConfig);

        const { entry } = webpackConfig;
        if (typeof entry === "string" || Array.isArray(entry)) {
            webpackConfig.entry = { bundle: entry };
        }

        NativeScriptSnapshotPlugin.ensureSnapshotModuleEntry(this.options);
    }

    NativeScriptSnapshotPlugin.removeLibraryTarget = function(webpackConfig) {
        const { output } = webpackConfig;
        if (output) {
            output.libraryTarget = undefined;
        }
    }

    NativeScriptSnapshotPlugin.ensureSnapshotModuleEntry = function(options) {
        const { webpackConfig, requireModules, chunks, projectRoot } = options;

        const androidProjectPath = getAndroidProjectPath({ projectRoot: projectRoot });
        const snapshotEntryPath = join(androidProjectPath, SNAPSHOT_ENTRY_MODULE);
        const snapshotEntryContent = requireModules.map(mod => `require('${mod}')`).join(";");
        writeFileSync(snapshotEntryPath, snapshotEntryContent, { encoding: "utf8" });

        // add the module to the entry points to make sure it's content is evaluated
        webpackConfig.entry[SNAPSHOT_ENTRY_NAME] = relative(webpackConfig.context, snapshotEntryPath);

        // prepend the module to the script that will be snapshotted
        chunks.unshift(SNAPSHOT_ENTRY_NAME);

        // ensure that the runtime is installed only in the snapshotted chunk
        webpackConfig.optimization.runtimeChunk = { name: SNAPSHOT_ENTRY_NAME };
    }

    NativeScriptSnapshotPlugin.validateSchema = function(options) {
        if (!options.chunk && !options.chunks) {
            const error = NativeScriptSnapshotPlugin.extendError({ message: `No chunks specified!` });
            throw error;
        }

        try {
            validateOptions(schema, options, "NativeScriptSnapshotPlugin");

            if (options.chunk) {
                options.chunks = options.chunks || [];
                options.chunks.push(options.chunk);
            }
        } catch (error) {
           throw new Error(error.message);
        }
    }

    NativeScriptSnapshotPlugin.prototype = Object.create(ProjectSnapshotGenerator.prototype);
    NativeScriptSnapshotPlugin.prototype.constructor = NativeScriptSnapshotPlugin;

    NativeScriptSnapshotPlugin.prototype.generate = function (webpackChunks) {
        const options = this.options;
        const inputFiles = webpackChunks.map(chunk => join(options.webpackConfig.output.path, chunk.files[0]));
        console.log(`\n Snapshotting bundle from ${inputFiles}`);

        const preparedAppRootPath = resolveAndroidAppPath(this.options.projectRoot);
        const preprocessedInputFile = join(preparedAppRootPath, "_embedded_script_.js");

        return ProjectSnapshotGenerator.prototype.generate.call(this, {
            inputFiles,
            preprocessedInputFile,
            targetArchs: options.targetArchs,
            useLibs: options.useLibs,
            androidNdkPath: options.androidNdkPath,
            v8Version: options.v8Version,
        }).then(() => {
            // Make the original files empty
            inputFiles.forEach(inputFile =>
                closeSync(openSync(inputFile, "w")) // truncates the input file content
            );
        });
    }

    NativeScriptSnapshotPlugin.prototype.apply = function (compiler) {
        const options = this.options;

        compiler.plugin("after-emit", function (compilation, callback) {
            const chunksToSnapshot = options.chunks
                .map(name => ({ name, chunk: compilation.chunks.find(chunk => chunk.name === name) }));
            const unexistingChunks = chunksToSnapshot.filter(pair => !pair.chunk);

            if (unexistingChunks.length) {
                const message = `The following chunks does not exist: ` + unexistingChunks.map(pair => pair.name).join(", ");
                const error = NativeScriptSnapshotPlugin.extendError({ message });
                compilation.errors.push(error);
                return callback();
            }

            this.generate(chunksToSnapshot.map(pair => pair.chunk))
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
