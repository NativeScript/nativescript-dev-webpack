const path = require("path");
const fs = require("fs");
const shelljs = require("shelljs");
const os = require("os");

const SnapshotGenerator = require("./snapshot-generator");
const TnsJavaClassesGenerator = require("./tns-java-classes-generator");
const { isVersionGte } = require("../../utils");
const { getPackageJson } = require("../../projectHelpers");

const MIN_ANDROID_RUNTIME_VERSION = "3.0.0";
const VALID_ANDROID_RUNTIME_TAGS = Object.freeze(["next", "rc"]);

function ProjectSnapshotGenerator (options) {
    this.options = options = options || {};

    options.projectRoot = options.projectRoot ?
        (path.isAbsolute(options.projectRoot) ?
            options.projectRoot :
            path.resolve(process.cwd(), options.projectRoot)) :
        process.cwd();

    if (!options.projectRoot) {
        throw new Error("The project root is not specified.");
    }

    console.log("Project root: " + options.projectRoot);
    console.log("Snapshots build directory: " + this.getBuildPath());

    this.validateAndroidRuntimeVersion();
}
module.exports = ProjectSnapshotGenerator;

ProjectSnapshotGenerator.calculateBuildPath = function(projectRoot) {
    return path.join(projectRoot, "platforms/android/snapshot-build/build");
}

ProjectSnapshotGenerator.prototype.getBuildPath = function() {
    return ProjectSnapshotGenerator.calculateBuildPath(this.options.projectRoot);
}

ProjectSnapshotGenerator.cleanSnapshotArtefacts = function(projectRoot) {
    const platformPath = path.join(projectRoot, "platforms/android");

    // Remove blob files from prepared folder
    shelljs.rm("-rf", path.join(platformPath, "src/main/assets/snapshots"));

    // Remove prepared include.gradle configurations
    shelljs.rm("-rf", path.join(platformPath, "configurations/", SnapshotGenerator.SNAPSHOT_PACKAGE_NANE));
}

ProjectSnapshotGenerator.installSnapshotArtefacts = function(projectRoot) {
    const buildPath = ProjectSnapshotGenerator.calculateBuildPath(projectRoot);
    const platformPath = path.join(projectRoot, "platforms/android");
    const assetsPath = path.join(platformPath, "src/main/assets");
    const configDestinationPath = path.join(platformPath, "configurations", SnapshotGenerator.SNAPSHOT_PACKAGE_NANE);

    // Remove build folder to make sure that the apk will be fully rebuild
    shelljs.rm("-rf", path.join(platformPath, "build"));

    // Copy include.gradle to the specified destination in the platforms folder
    shelljs.mkdir("-p", configDestinationPath);
    shelljs.cp(path.join(buildPath, "include.gradle"), path.join(configDestinationPath, "include.gradle"));

    // Copy tns-java-classes.js
    if (shelljs.test("-e", path.join(buildPath, "tns-java-classes.js"))) {
        shelljs.cp(path.join(buildPath, "tns-java-classes.js"), path.join(assetsPath, "app/tns-java-classes.js"));
    }

    if (shelljs.test("-e", path.join(buildPath, "ndk-build/libs"))) {
        // useLibs = true
        const libsDestinationPath = path.join(platformPath, "src", SnapshotGenerator.SNAPSHOT_PACKAGE_NANE, "jniLibs");

        // Copy the libs to the specified destination in the platforms folder
        shelljs.mkdir("-p", libsDestinationPath);
        shelljs.cp("-R", path.join(buildPath, "ndk-build/libs") + "/", libsDestinationPath);
    }
    else {
        // useLibs = false
        const blobsSrcPath = path.join(buildPath, "snapshots/blobs");
        const blobsDestinationPath = path.join(assetsPath, "snapshots");
        const appPackageJsonPath = path.join(assetsPath, "app/package.json");

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
    const nativescriptLibraryPath = path.join(this.options.projectRoot, "platforms/android/libs/runtime-libs/nativescript-regular.aar");
    if (!fs.existsSync(nativescriptLibraryPath)) {
        nativescriptLibraryPath = path.join(options.projectRoot, "platforms/android/libs/runtime-libs/nativescript.aar");
    }

    const zip = new require("adm-zip")(nativescriptLibraryPath);
    const config = zip.readAsText("config.json");
    return config ? JSON.parse(config)["v8-version"] : "4.7.80";
}

ProjectSnapshotGenerator.prototype.getAndroidRuntimeVersion = function() {
    try {
        const projectPackageJSON = getPackageJson(this.options.projectRoot);

        return projectPackageJSON["nativescript"]["tns-android"]["version"];
    } catch(e) {
        return null;
    }
}

ProjectSnapshotGenerator.prototype.validateAndroidRuntimeVersion = function() {
    const currentRuntimeVersion = this.getAndroidRuntimeVersion();

    if (!currentRuntimeVersion ||
        !fs.existsSync(path.join(this.options.projectRoot, "platforms/android"))) {

        throw new Error("In order to generate a V8 snapshot you must have the \"android\" platform installed - to do so please run \"tns platform add android\".");
    }

    if (!VALID_ANDROID_RUNTIME_TAGS.includes(currentRuntimeVersion) &&
        !isVersionGte(currentRuntimeVersion, MIN_ANDROID_RUNTIME_VERSION)) {

        throw new Error("In order to support heap snapshots, you must have at least tns-android@" + MIN_ANDROID_RUNTIME_VERSION +
            " installed. Current Android Runtime version is: " + currentRuntimeVersion + ".");
    }
}

ProjectSnapshotGenerator.prototype.generateTnsJavaClassesFile = function(generationOptions) {
    const tnsJavaClassesGenerator = new TnsJavaClassesGenerator();
    return tnsJavaClassesGenerator.generate({
        projectRoot: this.options.projectRoot,
        output: generationOptions.output,
        options: generationOptions.options
    });
}

ProjectSnapshotGenerator.prototype.generate = function(generationOptions) {
    generationOptions = generationOptions || {};

    console.log("Running snapshot generation with the following arguments: ");
    console.log(JSON.stringify(generationOptions, null, '\t'));

    // Clean build folder
    shelljs.rm("-rf", this.getBuildPath());
    shelljs.mkdir("-p", this.getBuildPath());

    // Generate tns-java-classes.js if needed
    var tnsJavaClassesDestination = path.join(this.getBuildPath(), "tns-java-classes.js");
    if (generationOptions.tnsJavaClassesPath) {
        if (generationOptions.tnsJavaClassesPath != tnsJavaClassesDestination) {
            shelljs.cp(generationOptions.tnsJavaClassesPath, tnsJavaClassesDestination);
        }
    }
    else {
        this.generateTnsJavaClassesFile({ output: tnsJavaClassesDestination, options: generationOptions.tnsJavaClassesOptions });
    }

    var snapshotToolsPath = generationOptions.snapshotToolsPath ?
        (path.isAbsolute(generationOptions.snapshotToolsPath) ? 
            generationOptions.snapshotToolsPath : 
            path.resolve(process.cwd(), generationOptions.snapshotToolsPath)) : 
        path.join(os.tmpdir(), "snapshot-tools");

    console.log("Snapshot tools path: " + snapshotToolsPath);

    // Generate snapshots
    const generator = new SnapshotGenerator({ buildPath: this.getBuildPath() });
    return generator.generate({
        snapshotToolsPath: snapshotToolsPath,
        inputFile: generationOptions.inputFile || path.join(this.options.projectRoot, "__snapshot.js"),
        targetArchs: generationOptions.targetArchs || ["arm", "arm64", "ia32"],
        v8Version: generationOptions.v8Version || this.getV8Version(),
        preprocessedInputFile: generationOptions.preprocessedInputFile,
        useLibs: generationOptions.useLibs || false,
        androidNdkPath: generationOptions.androidNdkPath
    }).then(() => {
        console.log("Snapshots build finished succesfully!");

        if (generationOptions.install) {
            ProjectSnapshotGenerator.cleanSnapshotArtefacts(this.options.projectRoot);
            ProjectSnapshotGenerator.installSnapshotArtefacts(this.options.projectRoot);
            console.log(generationOptions.useLibs ? 
                "Snapshot is included in the app as dynamically linked library (.so file)." :
                "Snapshot is included in the app as binary .blob file. The more space-efficient option is to embed it in a dynamically linked library (.so file).");
        }
    });
}
