const fs = require("fs");
const shelljs = require("shelljs");
const path = require("path");
const os = require("os");
const child_process = require("child_process");
const https = require("https");


const shellJsExecuteInDir = function(dir, action) {
    var currentDir = shelljs.pwd();
    shelljs.cd(dir);
    try {
        action();
    } finally {
        shelljs.cd(currentDir);
    }
}

function SnapshotGenerator(options) {
    this.buildPath = options.buildPath || path.join(__dirname, "build");
}
module.exports = SnapshotGenerator;

SnapshotGenerator.MKSNAPSHOT_TOOLS_PATH = path.join(__dirname, "snapshot-generator-tools/mksnapshot");
SnapshotGenerator.NDK_BUILD_SEED_PATH = path.join(__dirname, "snapshot-generator-tools/ndk-build");
SnapshotGenerator.BUNDLE_PREAMBLE_PATH = path.join(__dirname, "snapshot-generator-tools/bundle-preamble.js");
SnapshotGenerator.BUNDLE_ENDING_PATH = path.join(__dirname, "snapshot-generator-tools/bundle-ending.js");
SnapshotGenerator.INCLUDE_GRADLE_PATH = path.join(__dirname, "snapshot-generator-tools/include.gradle");
SnapshotGenerator.SNAPSHOT_PACKAGE_NANE = "nativescript-android-snapshot";

SnapshotGenerator.prototype.preprocessInputFile = function(inputFile, outputFile) {
    // Make some modifcations on the original bundle and save it on the specified path
    var bundlePreambleContent = fs.readFileSync(SnapshotGenerator.BUNDLE_PREAMBLE_PATH, "utf8");
    var bundleEndingContent = fs.readFileSync(SnapshotGenerator.BUNDLE_ENDING_PATH, "utf8");
    var snapshotFileContent = bundlePreambleContent + "\n" + fs.readFileSync(inputFile, "utf8") + "\n" + bundleEndingContent;
    fs.writeFileSync(outputFile, snapshotFileContent, { encoding: "utf8" });
}

var snapshotToolsDownloads = {};

SnapshotGenerator.prototype.downloadMksnapshotTool = function(snapshotToolsPath, v8Version, targetArch) {
    var hostOS = os.type().toLowerCase();
    hostOS = /^darwin/.test(hostOS) ? "darwin" : (/^linux/.test(hostOS) ? "linux" : (/^win/.test(hostOS) ? "win" : hostOS));
    const mksnapshotToolRelativePath = path.join("mksnapshot-tools", "v8-v" + v8Version, hostOS + "-" + os.arch(), "mksnapshot-" + targetArch);
    const mksnapshotToolPath = path.join(snapshotToolsPath, mksnapshotToolRelativePath);
    if (fs.existsSync(mksnapshotToolPath))
        return Promise.resolve(mksnapshotToolPath);

    if (snapshotToolsDownloads[mksnapshotToolPath])
        return snapshotToolsDownloads[mksnapshotToolPath];

    shelljs.mkdir("-p", path.dirname(mksnapshotToolPath));

    snapshotToolsDownloads[mksnapshotToolPath] = new Promise((resolve, reject) => {

        var download = function(url) {
            var request = https.get(url, (response) => {
                switch (response.statusCode) {
                    case 200:
                        var file = fs.createWriteStream(mksnapshotToolPath);
                        file.on("finish", function(){
                            file.close();
                            fs.chmodSync(mksnapshotToolPath, 0755);
                            resolve(mksnapshotToolPath);
                        });
                        response.pipe(file);
                        break;
                    case 301:
                    case 302:
                    case 303:
                        var redirectUrl = response.headers.location;
                        return download(redirectUrl);
                    default:
                        reject(new Error("Unable to download file at " + url + ". Status code: " + response.statusCode));
                }
            });

            request.end();

            request.on('error', function(err) {
                reject(err);
            });
        }

        var downloadUrl = "https://raw.githubusercontent.com/NativeScript/mksnapshot-tools/production/" + mksnapshotToolRelativePath;
        download(downloadUrl);
    });

    return snapshotToolsDownloads[mksnapshotToolPath];
}

SnapshotGenerator.prototype.convertToAndroidArchName = function(archName) {
    switch (archName) {
        case "arm": return "armeabi-v7a";
        case "arm64": return "arm64-v8a";
        case "ia32": return "x86";
        case "x64": return "x64";
        default: return archName;
    }
}

SnapshotGenerator.prototype.runMksnapshotTool = function(snapshotToolsPath, inputFile, v8Version, targetArchs, buildCSource) {
    // Cleans the snapshot build folder
    shelljs.rm("-rf", path.join(this.buildPath, "snapshots"));

    const mksnapshotStdErrPath = path.join(this.buildPath, "mksnapshot-stderr.txt");

    return Promise.all(targetArchs.map((arch) => {
        return this.downloadMksnapshotTool(snapshotToolsPath, v8Version, arch).then((currentArchMksnapshotToolPath) => {
            if (!fs.existsSync(currentArchMksnapshotToolPath)) {
                throw new Error("Can't find mksnapshot tool for " + arch + " at path " + currentArchMksnapshotToolPath);
            }

            var androidArch = this.convertToAndroidArchName(arch);
            console.log("***** Generating snapshot for " + androidArch + " *****");
            
            // Generate .blob file
            var currentArchBlobOutputPath = path.join(this.buildPath, "snapshots/blobs", androidArch);
            shelljs.mkdir("-p", currentArchBlobOutputPath);
            var stdErrorStream = fs.openSync(mksnapshotStdErrPath, 'w');
            child_process.execSync(currentArchMksnapshotToolPath + " " + inputFile + " --startup_blob " + path.join(currentArchBlobOutputPath, "TNSSnapshot.blob") + " --profile_deserialization", {encoding: "utf8", stdio: [process.stdin, process.stdout, stdErrorStream]});
            fs.closeSync(stdErrorStream);

            if (fs.statSync(mksnapshotStdErrPath).size) {
                console.error("***** SNAPSHOT GENERATION FOR " + androidArch + " FAILED! *****");
                var errorMessage = fs.readFileSync(mksnapshotStdErrPath, "utf8");
                // console.error(errorMessage);
                throw new Error(errorMessage);
            }

            // Generate .c file
            if (buildCSource) {
                var currentArchSrcOutputPath = path.join(this.buildPath, "snapshots/src", androidArch);
                shelljs.mkdir("-p", currentArchSrcOutputPath);
                shellJsExecuteInDir(currentArchBlobOutputPath, function(){
                    shelljs.exec("xxd -i TNSSnapshot.blob > " + path.join(currentArchSrcOutputPath, "TNSSnapshot.c"));
                });
            }
        });
    })).then(() => {
        console.log("***** Finished generating snapshots. *****");
    });
}

SnapshotGenerator.prototype.buildSnapshotLibs = function(androidNdkBuildPath, targetArchs) {
    // Compile *.c files to produce *.so libraries with ndk-build tool
    const ndkBuildPath = path.join(this.buildPath, "ndk-build");
    const androidArchs = targetArchs.map(arch => this.convertToAndroidArchName(arch));
    console.log("Building native libraries for " + androidArchs.join());
    shelljs.rm("-rf", ndkBuildPath);
    shelljs.cp("-r", SnapshotGenerator.NDK_BUILD_SEED_PATH, ndkBuildPath);
    fs.writeFileSync(path.join(ndkBuildPath, "jni/Application.mk"), "APP_ABI := " + androidArchs.join(" ")); // create Application.mk file
    shelljs.mv(path.join(this.buildPath, "snapshots/src/*"), path.join(ndkBuildPath, "jni"));
    shellJsExecuteInDir(ndkBuildPath, function(){
        shelljs.exec(androidNdkBuildPath);
    });
    return path.join(ndkBuildPath, "libs");
}

SnapshotGenerator.prototype.buildIncludeGradle = function() {
    shelljs.cp(SnapshotGenerator.INCLUDE_GRADLE_PATH, path.join(this.buildPath, "include.gradle"));
}

SnapshotGenerator.prototype.generate = function(options) {
    // Arguments validation
    options = options || {};
    if (!options.inputFile) { throw new Error("inputFile option is not specified."); }
    if (!shelljs.test("-e", options.inputFile)) { throw new Error("Can't find V8 snapshot input file: '" + options.inputFile + "'."); }
    if (!options.targetArchs || options.targetArchs.length == 0) { throw new Error("No target archs specified."); }
    if (!options.v8Version) { throw new Error("No v8 version specified."); }
    if (!options.snapshotToolsPath) { throw new Error("snapshotToolsPath option is not specified."); }
    var preprocessedInputFile = options.preprocessedInputFile ||  path.join(this.buildPath, "inputFile.preprocessed");

    this.preprocessInputFile(options.inputFile, preprocessedInputFile);

    // generates the actual .blob and .c files
    return this.runMksnapshotTool(options.snapshotToolsPath, preprocessedInputFile, options.v8Version, options.targetArchs, options.useLibs).then(() => {
        if (options.useLibs) {
            const androidNdkBuildPath = options.androidNdkPath ? path.join(options.androidNdkPath, "ndk-build") : "ndk-build";
            this.buildSnapshotLibs(androidNdkBuildPath, options.targetArchs);
            this.buildIncludeGradle();
        }
        return this.buildPath;
    });
}