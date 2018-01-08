const { dirname, isAbsolute, join, resolve } = require("path");
const { existsSync, readFileSync, writeFileSync } = require("fs");

const shelljs = require("shelljs");
const semver = require("semver");

const SnapshotGenerator = require("./snapshot-generator");
const TnsJavaClassesGenerator = require("./tns-java-classes-generator");
const {
    CONSTANTS,
    createDirectory,
    getJsonFile,
} = require("./utils");
const {
    getPackageJson,
    getAndroidRuntimeVersion,
    getAndroidProjectPath,
    resolveAndroidAppPath,
    resolveAndroidConfigurationsPath,
} = require("../../projectHelpers");

const MIN_ANDROID_RUNTIME_VERSION = "3.0.0";
const VALID_ANDROID_RUNTIME_TAGS = Object.freeze(["next", "rc"]);
const V8_VERSIONS_FILE_NAME = "v8-versions.json";
const V8_VERSIONS_URL = `https://raw.githubusercontent.com/NativeScript/android-runtime/master/${V8_VERSIONS_FILE_NAME}`;
const V8_VERSIONS_LOCAL_PATH = resolve(CONSTANTS.SNAPSHOT_TMP_DIR, V8_VERSIONS_FILE_NAME);

const resolveRelativePath = (path) => {
    if (path)
        return isAbsolute(path) ? path : resolve(process.cwd(), path);
    return null;
};

function ProjectSnapshotGenerator(options) {
    this.options = options = options || {};
    options.projectRoot = resolveRelativePath(options.projectRoot) || process.cwd();

    console.log("Project root: " + options.projectRoot);
    console.log("Snapshots build directory: " + this.getBuildPath());

    this.validateAndroidRuntimeVersion();
}
module.exports = ProjectSnapshotGenerator;

ProjectSnapshotGenerator.calculateBuildPath = function (projectRoot) {
    return join(
        ProjectSnapshotGenerator.calculateProjectPath(projectRoot),
        "snapshot-build",
        "build"
    );
}

ProjectSnapshotGenerator.prototype.getBuildPath = function () {
    return ProjectSnapshotGenerator.calculateBuildPath(this.options.projectRoot);
}

ProjectSnapshotGenerator.calculateProjectPath = function (projectRoot) {
    const projectPath = getAndroidProjectPath({projectRoot});
    return join(projectRoot, projectPath);
}

ProjectSnapshotGenerator.prototype.getProjectPath = function () {
    return ProjectSnapshotGenerator.calculateProjectPath(this.options.projectRoot);
}

ProjectSnapshotGenerator.cleanSnapshotArtefacts = function (projectRoot) {
    const platformPath = ProjectSnapshotGenerator.calculateProjectPath(projectRoot);

    // Remove blob files from prepared folder
    shelljs.rm("-rf", join(platformPath, "src/main/assets/snapshots"));

    // Remove prepared include.gradle configurations
    const configurationsPath = resolveAndroidConfigurationsPath(projectRoot);
    shelljs.rm("-rf", join(configurationsPath, SnapshotGenerator.SNAPSHOT_PACKAGE_NANE));
}

ProjectSnapshotGenerator.installSnapshotArtefacts = function (projectRoot) {
    const buildPath = ProjectSnapshotGenerator.calculateBuildPath(projectRoot);
    const platformPath = ProjectSnapshotGenerator.calculateProjectPath(projectRoot);

    const appPath = resolveAndroidAppPath(projectRoot);
    const configurationsPath = resolveAndroidConfigurationsPath(projectRoot);
    const configDestinationPath = join(configurationsPath, SnapshotGenerator.SNAPSHOT_PACKAGE_NANE);

    // Remove build folder to make sure that the apk will be fully rebuild
    shelljs.rm("-rf", join(platformPath, "build"));

    // Copy include.gradle to the specified destination in the platforms folder
    shelljs.mkdir("-p", configDestinationPath);
    shelljs.cp(join(buildPath, "include.gradle"), join(configDestinationPath, "include.gradle"));

    // Copy tns-java-classes.js
    if (shelljs.test("-e", join(buildPath, "tns-java-classes.js"))) {
        shelljs.cp(join(buildPath, "tns-java-classes.js"), join(appPath, "tns-java-classes.js"));
    }

    if (shelljs.test("-e", join(buildPath, "ndk-build/libs"))) {
        // useLibs = true
        const libsDestinationPath = join(platformPath, "src", SnapshotGenerator.SNAPSHOT_PACKAGE_NANE, "jniLibs");

        // Copy the libs to the specified destination in the platforms folder
        shelljs.mkdir("-p", libsDestinationPath);
        shelljs.cp("-R", join(buildPath, "ndk-build/libs") + "/", libsDestinationPath);
    }
    else {
        // useLibs = false
        const blobsSrcPath = join(buildPath, "snapshots/blobs");
        const blobsDestinationPath = resolve(appPath, "../snapshots");
        const appPackageJsonPath = join(appPath, "package.json");

        // Copy the blobs in the prepared app folder
        shelljs.cp("-R", blobsSrcPath + "/", resolve(appPath, "../snapshots"));

        /*
        Rename TNSSnapshot.blob files to snapshot.blob files. The xxd tool uses the file name for the name of the static array. This is why the *.blob files are initially named  TNSSnapshot.blob. After the xxd step, they must be renamed to snapshot.blob, because this is the filename that the Android runtime is looking for.
        */
        shelljs.exec("find " + blobsDestinationPath + " -name '*.blob' -execdir mv {} snapshot.blob ';'");

        // Update the package.json file
        const appPackageJson = shelljs.test("-e", appPackageJsonPath) ? JSON.parse(readFileSync(appPackageJsonPath, 'utf8')) : {};
        appPackageJson["android"] = appPackageJson["android"] || {};
        appPackageJson["android"]["heapSnapshotBlob"] = "../snapshots";
        writeFileSync(appPackageJsonPath, JSON.stringify(appPackageJson, null, 2));
    }
}

const versionIsPrerelease = version => version.indexOf("-") > -1;
const v8VersionsFileExists = () => existsSync(V8_VERSIONS_LOCAL_PATH);
const saveV8VersionsFile = versionsMap =>
    writeFileSync(V8_VERSIONS_LOCAL_PATH, JSON.stringify(versionsMap));
const readV8VersionsFile = () => JSON.parse(readFileSync(V8_VERSIONS_LOCAL_PATH));
const fetchV8VersionsFile = () =>
    new Promise((resolve, reject) => {
        getJsonFile(V8_VERSIONS_URL)
            .then(versionsMap => {
                createDirectory(dirname(V8_VERSIONS_LOCAL_PATH));
                saveV8VersionsFile(versionsMap);
                return resolve(versionsMap);
            })
            .catch(reject);
    });

const findV8Version = (runtimeVersion, v8VersionsMap) => {
    const runtimeRange = Object.keys(v8VersionsMap)
        .find(range => semver.satisfies(runtimeVersion, range));

    return v8VersionsMap[runtimeRange];
}

const getV8VersionsMap = runtimeVersion =>
    new Promise((resolve, reject) => {
        if (!v8VersionsFileExists() || versionIsPrerelease(runtimeVersion)) {
            fetchV8VersionsFile()
                .then(versionsMap => resolve({ versionsMap, latest: true }))
                .catch(reject);
        } else {
            const versionsMap = readV8VersionsFile();
            return resolve({ versionsMap, latest: false });
        }
    });

ProjectSnapshotGenerator.prototype.getV8Version = function (generationOptions) {
    return new Promise((resolve, reject) => {
        const maybeV8Version = generationOptions.v8Version;
        if (maybeV8Version) {
            return resolve(maybeV8Version);
        }

        const runtimeVersion = getAndroidRuntimeVersion(this.options.projectRoot);
        getV8VersionsMap(runtimeVersion)
            .then(({ versionsMap, latest }) => {
                const v8Version = findV8Version(runtimeVersion, versionsMap);

                if (!v8Version && !latest) {
                    fetchV8VersionsFile().then(latestVersionsMap => {
                        const version = findV8Version(runtimeVersion, latestVersionsMap)
                        return resolve(version);
                    })
                    .catch(reject);
                } else {
                    return resolve(v8Version);
                }
            })
            .catch(reject);
    });
}

ProjectSnapshotGenerator.prototype.validateAndroidRuntimeVersion = function () {
    const currentRuntimeVersion = getAndroidRuntimeVersion(this.options.projectRoot);

    if (!currentRuntimeVersion || !this.getProjectPath()) {
        throw new Error("In order to generate a V8 snapshot you must have the \"android\" platform installed - to do so please run \"tns platform add android\".");
    }

    if (!VALID_ANDROID_RUNTIME_TAGS.includes(currentRuntimeVersion) &&
        !semver.gte(currentRuntimeVersion, MIN_ANDROID_RUNTIME_VERSION)) {

        throw new Error("In order to support heap snapshots, you must have at least tns-android@" + MIN_ANDROID_RUNTIME_VERSION +
            " installed. Current Android Runtime version is: " + currentRuntimeVersion + ".");
    }
}

ProjectSnapshotGenerator.prototype.generateTnsJavaClassesFile = function (generationOptions) {
    const tnsJavaClassesGenerator = new TnsJavaClassesGenerator();
    return tnsJavaClassesGenerator.generate({
        projectRoot: this.options.projectRoot,
        output: generationOptions.output,
        options: generationOptions.options
    });
}

ProjectSnapshotGenerator.prototype.generate = function (generationOptions) {
    generationOptions = generationOptions || {};

    console.log("Running snapshot generation with the following arguments: ");
    console.log(JSON.stringify(generationOptions, null, '\t'));

    // Clean build folder
    shelljs.rm("-rf", this.getBuildPath());
    shelljs.mkdir("-p", this.getBuildPath());

    // Generate tns-java-classes.js if needed
    const tnsJavaClassesDestination = join(this.getBuildPath(), "tns-java-classes.js");
    if (generationOptions.tnsJavaClassesPath) {
        if (generationOptions.tnsJavaClassesPath != tnsJavaClassesDestination) {
            shelljs.cp(generationOptions.tnsJavaClassesPath, tnsJavaClassesDestination);
        }
    }
    else {
        this.generateTnsJavaClassesFile({ output: tnsJavaClassesDestination, options: generationOptions.tnsJavaClassesOptions });
    }

    const snapshotToolsPath = resolveRelativePath(generationOptions.snapshotToolsPath) || CONSTANTS.SNAPSHOT_TMP_DIR;
    const androidNdkPath = generationOptions.androidNdkPath || process.env.ANDROID_NDK_HOME;

    console.log("Snapshot tools path: " + snapshotToolsPath);

    // Generate snapshots
    const generator = new SnapshotGenerator({ buildPath: this.getBuildPath() });

    const noV8VersionFoundMessage = `Cannot find suitable v8 version!`;
    let shouldRethrow = false;
    return this.getV8Version(generationOptions).then(v8Version => {
        shouldRethrow = true;
        if (!v8Version) {
            throw new Error(noV8VersionFoundMessage);
        }

        return generator.generate({
            snapshotToolsPath,
            inputFile: generationOptions.inputFile || join(this.options.projectRoot, "__snapshot.js"),
            targetArchs: generationOptions.targetArchs || ["arm", "arm64", "ia32"],
            v8Version: generationOptions.v8Version || v8Version,
            preprocessedInputFile: generationOptions.preprocessedInputFile,
            useLibs: generationOptions.useLibs || false,
            androidNdkPath
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
    }).catch(error => {
        throw shouldRethrow ?
            error :
            new Error(`${noV8VersionFoundMessage} Original error: ${error.message || error}`);
    });
}
