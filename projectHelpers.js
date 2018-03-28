const path = require("path");
const fs = require("fs");
const semver = require("semver");
const { EOL } = require("os");
const hook = require("nativescript-hook")(__dirname);

const {
    PROJECT_DATA_GETTERS,
    getProjectData,
    safeGet,
} = require("./nsCliHelpers");

const APP_DIR = "app";

const isTypeScript = ({ projectDir, packageJson } = {}) => {
    packageJson = packageJson || getPackageJson(projectDir);

    return (
        packageJson.dependencies &&
        packageJson.dependencies.hasOwnProperty("typescript")
    ) || (
            packageJson.devDependencies &&
            packageJson.devDependencies.hasOwnProperty("typescript")
        ) || isAngular({ packageJson });
};

const isAngular = ({ projectDir, packageJson } = {}) => {
    packageJson = packageJson || getPackageJson(projectDir);

    return packageJson.dependencies && Object.keys(packageJson.dependencies)
        .some(dependency => /^@angular\b/.test(dependency));
};

const isSass = ({ projectDir, packageJson } = {}) => {
    packageJson = packageJson || getPackageJson(projectDir);

    return (
        packageJson.dependencies &&
        packageJson.dependencies.hasOwnProperty("nativescript-dev-sass")
    ) || (
            packageJson.devDependencies &&
            packageJson.devDependencies.hasOwnProperty("nativescript-dev-sass")
        );
};

const getAndroidRuntimeVersion = (projectDir) => {
    try {
        const projectPackageJSON = getPackageJson(projectDir);

        const version = projectPackageJSON["nativescript"]["tns-android"]["version"];
        return version && toReleaseVersion(version);
    } catch (e) {
        return null;
    }
}

const getWebpackConfig = (projectDir, env, configPath = "webpack.config.js") => {
    const configAbsolutePath = path.resolve(projectDir, configPath);
    let config;

    try {
        config = require(configAbsolutePath);
    } catch (e) {
        throw new Error(
            `Couldn't load webpack config from ${configAbsolutePath}. ` +
            `Original error:${EOL}${e}`
        );
    }
    if (typeof config === "function") {
        config = config(env);
    }

    if (!config) {
        throw new Error(`Webpack config from ${configAbsolutePath} is empty!`);
    }

    return config;
};

const getPackageJson = projectDir => {
    const packageJsonPath = getPackageJsonPath(projectDir);
    return JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
};

const writePackageJson = (content, projectDir) => {
    const packageJsonPath = getPackageJsonPath(projectDir);
    fs.writeFileSync(packageJsonPath, JSON.stringify(content, null, 2))
}
const getProjectDir = hook.findProjectDir;

const toReleaseVersion = version =>
    version.replace(/-.*/, "");

const getAndroidProjectPath = ({androidPackageVersion, projectRoot}) => {
    const ANDROID_PROJECT_PATH = "platforms/android";
    if (projectRoot) {
        androidPackageVersion = getAndroidRuntimeVersion(projectRoot);
    }

    return semver.lt(androidPackageVersion, "3.4.0") ?
        ANDROID_PROJECT_PATH :
        path.join(ANDROID_PROJECT_PATH, "app");
};


const resolveAndroidAppPath = projectDir => {
    const RESOURCES_PATH = "src/main/assets/app";
    const androidPackageVersion = getAndroidRuntimeVersion(projectDir);
    const androidProjectPath = getAndroidProjectPath({androidPackageVersion});

    return path.join(projectDir, androidProjectPath, RESOURCES_PATH);
};

const resolveAndroidConfigurationsPath = projectDir => {
    const CONFIGURATIONS_DIR = "configurations";
    const androidPackageVersion = getAndroidRuntimeVersion(projectDir);
    const androidProjectPath = getAndroidProjectPath({androidPackageVersion});

    const configurationsPath = semver.lt(androidPackageVersion, "3.3.0") ?
        path.join(androidProjectPath, CONFIGURATIONS_DIR):
        path.join(androidProjectPath, "build", CONFIGURATIONS_DIR);

    return path.join(projectDir, configurationsPath);
};

const getPackageJsonPath = projectDir => path.resolve(projectDir, "package.json");

const isAndroid = platform => /android/i.test(platform);
const isIos = platform => /ios/i.test(platform);

function getAppPath() {
    const projectDir = getProjectDir();
    const projectData = getProjectData(projectDir);
    const appDir = getAppPathFromProjectData(projectData) || APP_DIR;

    const appPath = path.resolve(projectDir, appDir);

    return appPath;
}

function getAppPathFromProjectData(data) {
    return safeGet(data, PROJECT_DATA_GETTERS.appPath);
}

function getAppResourcesPathFromProjectData(data) {
    return safeGet(data, PROJECT_DATA_GETTERS.appResourcesPath);
}

module.exports = {
    APP_DIR,
    getAppPath,
    getAppPathFromProjectData,
    getAppResourcesPathFromProjectData,
    getAndroidProjectPath,
    getAndroidRuntimeVersion,
    getPackageJson,
    getProjectDir,
    getWebpackConfig,
    isAndroid,
    isIos,
    isAngular,
    isSass,
    isTypeScript,
    resolveAndroidAppPath,
    resolveAndroidConfigurationsPath,
    writePackageJson,
};
