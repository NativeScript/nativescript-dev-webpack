var path = require("path");
var fs = require('fs');
var shelljs = require("shelljs");
var semver = require("semver");
var SnapshotGenerator = require("./snapshot-generator");

function ProjectSnapshotGenerator(options) {
    this.options = options = options || {};

    if (!options.projectRoot) {
        throw new Error("The project root is not specified.");
    }

    this.validateAndroidRuntimeVersion();
}
module.exports = ProjectSnapshotGenerator;

ProjectSnapshotGenerator.MIN_ANDROID_RUNTIME_VERSION_WITH_SNAPSHOT_SUPPORT = "3.0.0";

ProjectSnapshotGenerator.prototype.getV8Version = function() {
    var nativescriptLibraryPath = path.join(this.options.projectRoot, "platforms/android/libs/runtime-libs/nativescript-regular.aar");
    if (!fs.existsSync(nativescriptLibraryPath)) {
        nativescriptLibraryPath = path.join(options.projectRoot, "platforms/android/libs/runtime-libs/nativescript.aar");
    }

    var zip = new require("adm-zip")(nativescriptLibraryPath);
    var config = zip.readAsText("config.json");
    return config ? JSON.parse(config)["v8-version"] : "4.7.80";
}

ProjectSnapshotGenerator.prototype.getAndroidRuntimeVersion = function() {
    try {
        var projectPackageJSON = JSON.parse(fs.readFileSync(path.join(this.options.projectRoot, "package.json"), "utf8"));
        var version = projectPackageJSON["nativescript"]["tns-android"]["version"];
        return version.replace(/\-.*/, ""); // e.g. -rc
    } catch(e) {
        return null;
    }
}

ProjectSnapshotGenerator.prototype.validateAndroidRuntimeVersion = function() {
    var currentRuntimeVersion = this.getAndroidRuntimeVersion();

    if (!currentRuntimeVersion || !fs.existsSync(path.join(this.options.projectRoot, "platforms/android"))) {
        throw new Error("In order to generate a V8 snapshot you must have the \"android\" platform installed - to do so please run \"tns platform add android\".");
    }

    // The version could be "next"
    if (semver.valid(currentRuntimeVersion)) {
        if (!semver.gte(currentRuntimeVersion, ProjectSnapshotGenerator.MIN_ANDROID_RUNTIME_VERSION_WITH_SNAPSHOT_SUPPORT)) {
            throw new Error("In order to support heap snapshots, you must have at least tns-android@" + ProjectSnapshotGenerator.MIN_ANDROID_RUNTIME_VERSION_WITH_SNAPSHOT_SUPPORT +
                " installed. Current Android Runtime version is: " + currentRuntimeVersion + ".");
        }
    }
}

ProjectSnapshotGenerator.prototype.installSnapshotLibsPlugin = function(snapshotPluginContent) {
    // Add the module as dependency in package.json
    var packageJsonPath = path.join(this.options.projectRoot, "package.json");
    var packageJsonContent = shelljs.test("-e", packageJsonPath) ? JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) : {};

    packageJsonContent["dependencies"] = packageJsonContent["dependencies"] || {};
    // TODO: publish nativescript-generated-snaphsot in npm and use it from there
    packageJsonContent["dependencies"][SnapshotGenerator.SNAPSHOT_PACKAGE_NANE] = "ivanbuhov/nativescript-generated-snaphsot#master";

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJsonContent, null, 2));

    // Add the package to node_modules
    var snapshotPackagePath = path.join(this.options.projectRoot, "node_modules", SnapshotGenerator.SNAPSHOT_PACKAGE_NANE);
    shelljs.rm("-rf", snapshotPackagePath);
    shelljs.cp("-r", snapshotPluginContent, snapshotPackagePath);
}

ProjectSnapshotGenerator.prototype.installSnapshotBlobs = function(preparedAppRootPath, blobsPath) {
    // Copy the blobs in the prepared app folder
    var blobsDestination = path.join(preparedAppRootPath, "snapshots");
    shelljs.rm("-rf", blobsDestination);
    shelljs.cp("-R", blobsPath, blobsDestination + "/");
    /* 
    Rename TNSSnapshot.blob files to snapshot.blob files. The xxd tool uses the file name for the name of the static array. This is why the *.blob files are initially named  TNSSnapshot.blob. After the xxd step, they must be renamed to snapshot.blob, because this is the filename that the Android runtime is looking for.
    */
    shelljs.exec("find " + blobsDestination + " -name '*.blob' -execdir mv {} snapshot.blob ';'");
    // Update the package.json file
    this.addSnapshotKeyInPackageJSON(path.join(preparedAppRootPath, "app/package.json"));
}

ProjectSnapshotGenerator.prototype.addSnapshotKeyInPackageJSON = function(appPackageJSONPath) {
    var appPackageJSON = shelljs.test("-e", appPackageJSONPath) ? JSON.parse(fs.readFileSync(appPackageJSONPath, 'utf8')) : {};

    appPackageJSON["android"] = appPackageJSON["android"] || {};
    appPackageJSON["android"]["heapSnapshotBlob"] = "../snapshots";

    fs.writeFileSync(appPackageJSONPath, JSON.stringify(appPackageJSON, null, 2));
}

ProjectSnapshotGenerator.prototype.generate = function(generationOptions) {
    generationOptions = generationOptions || {};

    var generator = new SnapshotGenerator();
    var generatorBuildPath = generator.generate({
        inputFile: generationOptions.inputFile || path.join(this.options.projectRoot, "__snapshot.js"),
        targetArchs: generationOptions.targetArchs || ["arm", "arm64", "ia32"],
        v8Version: generationOptions.v8Version || this.getV8Version(),
        preprocessedInputFile: generationOptions.preprocessedInputFile,
        useLibs: generationOptions.useLibs || false,
        androidNdkPath: generationOptions.androidNdkPath
    });

    var preparedAppRootPath = path.join(this.options.projectRoot, "platforms/android/src/main/assets");

    if (generationOptions.useLibs) {
        this.installSnapshotLibsPlugin(path.join(generatorBuildPath, SnapshotGenerator.SNAPSHOT_PACKAGE_NANE));
        console.log("Snapshot is included in the app as dynamically linked library (.so file).");
    }
    else {
        this.installSnapshotBlobs(preparedAppRootPath, path.join(generatorBuildPath, "snapshots/blobs"));
        console.log("Snapshot is included in the app as binary .blob file. The more space-efficient option is to embed it in a dynamically linked library (.so file).");
    }
}