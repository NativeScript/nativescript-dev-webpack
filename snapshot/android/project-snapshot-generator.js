var path = require("path");
var fs = require('fs');
var shelljs = require("shelljs");
var semver = require("semver");
var SnapshotGenerator = require("./snapshot-generator");
var TnsJavaClassesGenerator = require("./tns-java-classes-generator");

function ProjectSnapshotGenerator(options) {
    this.options = options = options || {};

    if (!options.projectRoot) {
        throw new Error("The project root is not specified.");
    }

    this.validateAndroidRuntimeVersion();
}
module.exports = ProjectSnapshotGenerator;

ProjectSnapshotGenerator.MIN_ANDROID_RUNTIME_VERSION_WITH_SNAPSHOT_SUPPORT = "3.0.0";
ProjectSnapshotGenerator.TNS_JAVA_CLASSES_BUILD_PATH = path.join(SnapshotGenerator.BUILD_PATH, "tns-java-classes.js");

ProjectSnapshotGenerator.cleanSnapshotArtefacts = function(projectRoot) {
    var platformPath = path.join(projectRoot, "platforms/android");

    // Remove blob files from prepared folder
    shelljs.rm("-rf", path.join(platformPath, "src/main/assets/snapshots"));

    // Remove prepared include.gradle configurations
    shelljs.rm("-rf", path.join(platformPath, "configurations/", SnapshotGenerator.SNAPSHOT_PACKAGE_NANE));
}

ProjectSnapshotGenerator.installSnapshotArtefacts = function(projectRoot) {
    var buildPath = SnapshotGenerator.BUILD_PATH;
    
    if (shelljs.test("-e", path.join(buildPath, "ndk-build/libs"))) {
        // useLibs = true
        var libsDestinationPath = path.join(projectRoot, "platforms/android/src", SnapshotGenerator.SNAPSHOT_PACKAGE_NANE, "jniLibs");
        var configDestinationPath = path.join(projectRoot, "platforms/android/configurations", SnapshotGenerator.SNAPSHOT_PACKAGE_NANE);

        // Copy the libs to the specified destination in the platforms folder
        shelljs.mkdir("-p", libsDestinationPath);
        shelljs.cp("-R", path.join(buildPath, "ndk-build/libs") + "/", libsDestinationPath);

        // Copy include.gradle to the specified destination in the platforms folder
        shelljs.mkdir("-p", configDestinationPath);
        shelljs.cp(path.join(buildPath, "include.gradle"), path.join(configDestinationPath, "include.gradle"));
    }
    else {
        // useLibs = false
        var assetsPath = path.join(projectRoot, "platforms/android/src/main/assets");
        var blobsSrcPath = path.join(buildPath, "snapshots/blobs");
        var blobsDestinationPath = path.join(assetsPath, "snapshots");
        var appPackageJsonPath = path.join(assetsPath, "app/package.json");
        
        // Copy the blobs in the prepared app folder
        shelljs.cp("-R", blobsSrcPath + "/", path.join(assetsPath, "snapshots"));

        /* 
        Rename TNSSnapshot.blob files to snapshot.blob files. The xxd tool uses the file name for the name of the static array. This is why the *.blob files are initially named  TNSSnapshot.blob. After the xxd step, they must be renamed to snapshot.blob, because this is the filename that the Android runtime is looking for.
        */
        shelljs.exec("find " + blobsDestinationPath + " -name '*.blob' -execdir mv {} snapshot.blob ';'");

        // Update the package.json file
        var appPackageJson = shelljs.test("-e", appPackageJsonPath) ? JSON.parse(fs.readFileSync(appPackageJsonPath, 'utf8')) : {};
        appPackageJson["android"] = appPackageJson["android"] || {};
        appPackageJson["android"]["heapSnapshotBlob"] = "../snapshots";
        fs.writeFileSync(appPackageJsonPath, JSON.stringify(appPackageJson, null, 2));
    }
}

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

ProjectSnapshotGenerator.prototype.generateTnsJavaClassesFile = function(generationOptions) {
    var tnsJavaClassesGenerator = new TnsJavaClassesGenerator();
    return tnsJavaClassesGenerator.generate({
        projectRoot: this.options.projectRoot, 
        output: generationOptions.output,
        options: generationOptions.options
    });
}

ProjectSnapshotGenerator.prototype.cleanBuildFolder = function() {
    // Clean build folder
    shelljs.rm("-rf", SnapshotGenerator.BUILD_PATH);
}

ProjectSnapshotGenerator.prototype.generate = function(generationOptions) {
    generationOptions = generationOptions || {};

    // Generate tns-java-classes.js if needed
    if (generationOptions.tnsJavaClassesPath) {
        if (generationOptions.tnsJavaClassesPath != ProjectSnapshotGenerator.TNS_JAVA_CLASSES_BUILD_PATH) {
            shelljs.cp(generationOptions.tnsJavaClassesPath, ProjectSnapshotGenerator.TNS_JAVA_CLASSES_BUILD_PATH);
        }
    }
    else {
        this.generateTnsJavaClassesFile({ output: ProjectSnapshotGenerator.TNS_JAVA_CLASSES_BUILD_PATH, options: generationOptions.tnsJavaClassesOptions });
    }

    // Generate snapshots
    var generator = new SnapshotGenerator();
    var generatorBuildPath = generator.generate({
        inputFile: generationOptions.inputFile || path.join(this.options.projectRoot, "__snapshot.js"),
        targetArchs: generationOptions.targetArchs || ["arm", "arm64", "ia32"],
        v8Version: generationOptions.v8Version || this.getV8Version(),
        preprocessedInputFile: generationOptions.preprocessedInputFile,
        useLibs: generationOptions.useLibs || false,
        androidNdkPath: generationOptions.androidNdkPath
    });

    console.log(generationOptions.useLibs ? 
        "Snapshot is included in the app as dynamically linked library (.so file)." :
        "Snapshot is included in the app as binary .blob file. The more space-efficient option is to embed it in a dynamically linked library (.so file).");
}