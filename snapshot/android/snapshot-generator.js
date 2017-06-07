var fs = require("fs");
var shelljs = require("shelljs");
var path = require("path");
var os = require("os");
var child_process = require("child_process");

var shellJsExecuteInDir = function(dir, action) {
    var currentDir = shelljs.pwd();
    shelljs.cd(dir);
    try {
        action();
    } finally {
        shelljs.cd(currentDir);
    }
}

function SnapshotGenerator() {}
module.exports = SnapshotGenerator;

SnapshotGenerator.BUILD_PATH = path.join(__dirname, "build");
SnapshotGenerator.MKSNAPSHOT_TOOLS_PATH = path.join(__dirname, "snapshot-generator-tools/mksnapshot");
SnapshotGenerator.NDK_BUILD_SEED_PATH = path.join(__dirname, "snapshot-generator-tools/ndk-build");
SnapshotGenerator.BUNDLE_PREAMBLE_PATH = path.join(__dirname, "snapshot-generator-tools/bundle-preamble.js");
SnapshotGenerator.SNAPSHOT_PACKAGE_NANE = "nativescript-generated-snapshot";
SnapshotGenerator.SNAPSHOT_PLUGIN_SEED_PATH = path.join(__dirname, "snapshot-generator-tools", SnapshotGenerator.SNAPSHOT_PACKAGE_NANE + "-plugin-seed");

SnapshotGenerator.prototype.preprocessInputFile = function(inputFile, outputFile) {
    // Make some modifcations on the original bundle and save it on the specified path
    var bundlePreambleContent = fs.readFileSync(SnapshotGenerator.BUNDLE_PREAMBLE_PATH, "utf8");
    var snapshotFileContent = bundlePreambleContent + fs.readFileSync(inputFile, "utf8");
    fs.writeFileSync(outputFile, snapshotFileContent, { encoding: "utf8" });
}

SnapshotGenerator.prototype.getMksnapshotToolsDirOrThrow = function(v8Version) {
    var hostOS = os.type().toLowerCase();
    hostOS = /^darwin/.test(hostOS) ? "darwin" : (/^linux/.test(hostOS) ? "linux" : (/^win/.test(hostOS) ? "win" : hostOS));
    var mksnapshotToolsDir = path.join(SnapshotGenerator.MKSNAPSHOT_TOOLS_PATH, "mksnapshot-" + v8Version, hostOS + "-" + os.arch());
    if (!fs.existsSync(mksnapshotToolsDir)) {
        throw new Error("No snapshot tools available for v8 v" + v8Version + " on " + os.type() + " OS.");
    }
    return mksnapshotToolsDir;
}

SnapshotGenerator.prototype.convertToAndroidArchName = function(archName) {
    switch (archName) {
        case "arm": return "armeabi-v7a";
        case "arm64": return "arm64-v8a";
        case "ia32": return "x86";
        default: return archName;
    }
}

SnapshotGenerator.prototype.runMksnapshotTool = function(inputFile, v8Version, targetArchs, buildCSource) {
    // Cleans the snapshot build folder
    shelljs.rm("-rf", path.join(SnapshotGenerator.BUILD_PATH, "snapshots"));

    var mksnapshotToolsDir = this.getMksnapshotToolsDirOrThrow(v8Version);
    for (var index in targetArchs) {
        var arch = targetArchs[index];
        var currentArchMksnapshotToolPath = path.join(mksnapshotToolsDir, "mksnapshot-" + arch);
        if (!fs.existsSync(currentArchMksnapshotToolPath)) {
            console.log("***** Skipping " + arch + ". Unable to find mksnapshot tool for " + arch + ". *****");
            continue;
        }

        var androidArch = this.convertToAndroidArchName(arch);
        console.log("***** Generating snapshot for " + androidArch + " *****");
        
        // Generate .blob file
        var currentArchBlobOutputPath = path.join(SnapshotGenerator.BUILD_PATH, "snapshots/blobs", androidArch);
        shelljs.mkdir("-p", currentArchBlobOutputPath);
        child_process.execSync(currentArchMksnapshotToolPath + " " + inputFile + " --startup_blob " + path.join(currentArchBlobOutputPath, "TNSSnapshot.blob") + " --profile_deserialization", {encoding: "utf8", stdio: 'inherit'});

        // Generate .c file
        if (buildCSource) {
            var currentArchSrcOutputPath = path.join(SnapshotGenerator.BUILD_PATH, "snapshots/src", androidArch);
            shelljs.mkdir("-p", currentArchSrcOutputPath);
            shellJsExecuteInDir(currentArchBlobOutputPath, function(){
                shelljs.exec("xxd -i TNSSnapshot.blob > " + path.join(currentArchSrcOutputPath, "TNSSnapshot.c"));
            });
        }
    }
    console.log("***** Finished generating snapshots. *****");
}

SnapshotGenerator.prototype.buildSnapshotLibs = function(androidNdkBuildPath) {
    // Compile *.c files to produce *.so libraries with ndk-build tool
    var ndkBuildPath = path.join(SnapshotGenerator.BUILD_PATH, "ndk-build");
    shelljs.rm("-rf", ndkBuildPath);
    shelljs.cp("-r", SnapshotGenerator.NDK_BUILD_SEED_PATH, ndkBuildPath);
    shelljs.mv(path.join(SnapshotGenerator.BUILD_PATH, "snapshots/src/*"), path.join(ndkBuildPath, "jni"));
    shellJsExecuteInDir(ndkBuildPath, function(){
        shelljs.exec(androidNdkBuildPath);
    });
    return path.join(ndkBuildPath, "libs");
}

SnapshotGenerator.prototype.buildSnapshotLibsPlugin = function(builtLibsPath) {
    var pluginBuildPath = path.join(SnapshotGenerator.BUILD_PATH, SnapshotGenerator.SNAPSHOT_PACKAGE_NANE);
    shelljs.rm("-rf", pluginBuildPath);
    shelljs.cp("-r", SnapshotGenerator.SNAPSHOT_PLUGIN_SEED_PATH, pluginBuildPath);
    if (builtLibsPath) {
        shelljs.cp("-r", builtLibsPath, path.join(pluginBuildPath, "platforms/android/jniLibs" + "/"));
    }
    return pluginBuildPath;
}

SnapshotGenerator.prototype.generate = function(options) {
    // Arguments validation
    options = options || {};
    if (!options.inputFile) { throw new Error("inputFile option is not specified."); }
    if (!shelljs.test("-e", options.inputFile)) { throw new Error("Can't find V8 snapshot input file: '" + options.inputFile + "'."); }
    if (!options.targetArchs || options.targetArchs.length == 0) { throw new Error("No target archs specified."); }
    if (!options.v8Version) { throw new Error("No v8 version specified."); }
    var preprocessedInputFile = options.preprocessedInputFile || options.inputFile + ".preprocessed";

    this.preprocessInputFile(options.inputFile, preprocessedInputFile);
    this.runMksnapshotTool(preprocessedInputFile, options.v8Version, options.targetArchs, options.useLibs); // generates the actual .blob and .c files

    if (options.useLibs) {
        var androidNdkBuildPath = options.androidNdkPath ? path.join(options.androidNdkPath, "ndk-build") : "ndk-build";
        libsPath = this.buildSnapshotLibs(androidNdkBuildPath);
        this.buildSnapshotLibsPlugin(libsPath);
    }
    return SnapshotGenerator.BUILD_PATH;
}