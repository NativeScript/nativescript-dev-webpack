const fs = require("fs");
const shelljs = require("shelljs");
const { join, dirname } = require("path");
const os = require("os");
const child_process = require("child_process");
const https = require("https");

const NDK_BUILD_SEED_PATH = join(__dirname, "snapshot-generator-tools/ndk-build");
const BUNDLE_PREAMBLE_PATH = join(__dirname, "snapshot-generator-tools/bundle-preamble.js");
const BUNDLE_ENDING_PATH = join(__dirname, "snapshot-generator-tools/bundle-ending.js");
const INCLUDE_GRADLE_PATH = join(__dirname, "snapshot-generator-tools/include.gradle");
const MKSNAPSHOT_TOOLS_DOWNLOAD_ROOT_URL = "https://raw.githubusercontent.com/NativeScript/mksnapshot-tools/production/";
const SNAPSHOT_BLOB_NAME = "TNSSnapshot";

function shellJsExecuteInDir(dir, action) {
    const currentDir = shelljs.pwd();
    shelljs.cd(dir);
    try {
        action();
    } finally {
        shelljs.cd(currentDir);
    }
}

function getHostOS() {
    const hostOS = os.type().toLowerCase();
    if (hostOS.startsWith("darwin"))
        return "darwin";
    if (hostOS.startsWith("linux"))
        return "linux";
    if (hostOS.startsWith("win"))
        return "win";
    return hostOS;
}

function SnapshotGenerator(options) {
    this.buildPath = options.buildPath || join(__dirname, "build");
}
module.exports = SnapshotGenerator;

SnapshotGenerator.SNAPSHOT_PACKAGE_NANE = "nativescript-android-snapshot";

SnapshotGenerator.prototype.preprocessInputFile = function(inputFile, outputFile) {
    // Make some modifcations on the original bundle and save it on the specified path
    const bundlePreambleContent = fs.readFileSync(BUNDLE_PREAMBLE_PATH, "utf8");
    const bundleEndingContent = fs.readFileSync(BUNDLE_ENDING_PATH, "utf8");
    const snapshotFileContent = bundlePreambleContent + "\n" + fs.readFileSync(inputFile, "utf8") + "\n" + bundleEndingContent;
    fs.writeFileSync(outputFile, snapshotFileContent, { encoding: "utf8" });
}

const snapshotToolsDownloads = {};

SnapshotGenerator.prototype.downloadMksnapshotTool = function(snapshotToolsPath, v8Version, targetArch) {
    const hostOS = getHostOS();
    const mksnapshotToolRelativePath = join("mksnapshot-tools", "v8-v" + v8Version, hostOS + "-" + os.arch(), "mksnapshot-" + targetArch);
    const mksnapshotToolPath = join(snapshotToolsPath, mksnapshotToolRelativePath);
    if (fs.existsSync(mksnapshotToolPath))
        return Promise.resolve(mksnapshotToolPath);

    if (snapshotToolsDownloads[mksnapshotToolPath])
        return snapshotToolsDownloads[mksnapshotToolPath];

    const downloadUrl = MKSNAPSHOT_TOOLS_DOWNLOAD_ROOT_URL + mksnapshotToolRelativePath;
    snapshotToolsDownloads[mksnapshotToolPath] = this.downloadExecFile(downloadUrl, mksnapshotToolPath);
    return snapshotToolsDownloads[mksnapshotToolPath];
}

SnapshotGenerator.prototype.downloadExecFile = function(url, destinationFilePath) {
    return new Promise((resolve, reject) => {
        const request = https.get(url, (response) => {
            switch (response.statusCode) {
                case 200:
                    shelljs.mkdir("-p", dirname(destinationFilePath));
                    const file = fs.createWriteStream(destinationFilePath);
                    file.on('error', function (error) {
                        return reject(error);
                    });
                    file.on("finish", function() {
                        file.close();
                        fs.chmodSync(destinationFilePath, 0755);
                        return resolve(destinationFilePath);
                    });
                    response.pipe(file);
                    break;
                case 301:
                case 302:
                case 303:
                    const redirectUrl = response.headers.location;
                    return this.downloadExecFile(redirectUrl, destinationFilePath);
                default:
                    return reject(new Error("Unable to download file at " + url + ". Status code: " + response.statusCode));
            }
        });

        request.end();

        request.on('error', function(err) {
            return reject(err);
        });
    });
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
    shelljs.rm("-rf", join(this.buildPath, "snapshots"));

    const mksnapshotStdErrPath = join(this.buildPath, "mksnapshot-stderr.txt");

    return Promise.all(targetArchs.map((arch) => {
        return this.downloadMksnapshotTool(snapshotToolsPath, v8Version, arch).then((currentArchMksnapshotToolPath) => {
            if (!fs.existsSync(currentArchMksnapshotToolPath)) {
                throw new Error("Can't find mksnapshot tool for " + arch + " at path " + currentArchMksnapshotToolPath);
            }

            const androidArch = this.convertToAndroidArchName(arch);
            console.log("***** Generating snapshot for " + androidArch + " *****");
            
            // Generate .blob file
            const currentArchBlobOutputPath = join(this.buildPath, "snapshots/blobs", androidArch);
            shelljs.mkdir("-p", currentArchBlobOutputPath);
            const command = `${currentArchMksnapshotToolPath} ${inputFile} --startup_blob ${join(currentArchBlobOutputPath, `${SNAPSHOT_BLOB_NAME}.blob`)} --profile_deserialization`;

            return new Promise((resolve, reject) => {
                const child = child_process.exec(command, {encoding: "utf8"}, (error, stdout, stderr) => {
                    console.log(`${stdout}`);
                    if (stderr.length) {
                        console.error("***** SNAPSHOT GENERATION FOR " + androidArch + " FAILED! *****");
                        console.error(stderr);
                        return reject(stderr);
                    }
                    if (error) {
                        return reject(error);
                    }
                    return resolve();
                })
            }).then(() => {
                // Generate .c file
                if (buildCSource) {
                    const currentArchSrcOutputPath = join(this.buildPath, "snapshots/src", androidArch);
                    shelljs.mkdir("-p", currentArchSrcOutputPath);
                    shellJsExecuteInDir(currentArchBlobOutputPath, function() {
                        shelljs.exec(`xxd -i ${SNAPSHOT_BLOB_NAME}.blob > ${join(currentArchSrcOutputPath, `${SNAPSHOT_BLOB_NAME}.c`)}`);
                    });
                }
            });
        });
    })).then(() => {
        console.log("***** Finished generating snapshots. *****");
    });
}

SnapshotGenerator.prototype.buildSnapshotLibs = function(androidNdkBuildPath, targetArchs) {
    // Compile *.c files to produce *.so libraries with ndk-build tool
    const ndkBuildPath = join(this.buildPath, "ndk-build");
    const androidArchs = targetArchs.map(arch => this.convertToAndroidArchName(arch));
    console.log("Building native libraries for " + androidArchs.join());
    shelljs.rm("-rf", ndkBuildPath);
    shelljs.cp("-r", NDK_BUILD_SEED_PATH, ndkBuildPath);
    fs.writeFileSync(join(ndkBuildPath, "jni/Application.mk"), "APP_ABI := " + androidArchs.join(" ")); // create Application.mk file
    shelljs.mv(join(this.buildPath, "snapshots/src/*"), join(ndkBuildPath, "jni"));
    shellJsExecuteInDir(ndkBuildPath, function(){
        shelljs.exec(androidNdkBuildPath);
    });
    return join(ndkBuildPath, "libs");
}

SnapshotGenerator.prototype.buildIncludeGradle = function() {
    shelljs.cp(INCLUDE_GRADLE_PATH, join(this.buildPath, "include.gradle"));
}

SnapshotGenerator.prototype.generate = function(options) {
    // Arguments validation
    options = options || {};
    if (!options.inputFile) { throw new Error("inputFile option is not specified."); }
    if (!shelljs.test("-e", options.inputFile)) { throw new Error("Can't find V8 snapshot input file: '" + options.inputFile + "'."); }
    if (!options.targetArchs || options.targetArchs.length == 0) { throw new Error("No target archs specified."); }
    if (!options.v8Version) { throw new Error("No v8 version specified."); }
    if (!options.snapshotToolsPath) { throw new Error("snapshotToolsPath option is not specified."); }
    const preprocessedInputFile = options.preprocessedInputFile ||  join(this.buildPath, "inputFile.preprocessed");

    this.preprocessInputFile(options.inputFile, preprocessedInputFile);

    // generates the actual .blob and .c files
    return this.runMksnapshotTool(
        options.snapshotToolsPath, 
        preprocessedInputFile, 
        options.v8Version, 
        options.targetArchs, 
        options.useLibs
    ).then(() => {
        this.buildIncludeGradle();
        if (options.useLibs) {
            const androidNdkBuildPath = options.androidNdkPath ? join(options.androidNdkPath, "ndk-build") : "ndk-build";
            this.buildSnapshotLibs(androidNdkBuildPath, options.targetArchs);
        }
        return this.buildPath;
    });
}