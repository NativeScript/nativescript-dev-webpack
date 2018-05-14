const { resolve } = require("path");
const { readFileSync, writeFileSync } = require("fs");
const { EOL } = require("os");

const hook = require("nativescript-hook")(__dirname);

const PROJECT_DATA_GETTERS = {
    appPath: "getAppDirectoryRelativePath",
    appResourcesPath: "getAppResourcesRelativeDirectoryPath",
};

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
    const SASS_PLUGIN_NAME = "nativescript-dev-sass";

    return (
        packageJson.dependencies &&
        packageJson.dependencies.hasOwnProperty(SASS_PLUGIN_NAME)
    ) || (
        packageJson.devDependencies &&
        packageJson.devDependencies.hasOwnProperty(SASS_PLUGIN_NAME)
    );
};

const getWebpackConfig = (projectDir, env, configPath = "webpack.config.js") => {
    const configAbsolutePath = resolve(projectDir, configPath);
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
    return JSON.parse(readFileSync(packageJsonPath, "utf8"));
};

const writePackageJson = (content, projectDir) => {
    const packageJsonPath = getPackageJsonPath(projectDir);
    writeFileSync(packageJsonPath, JSON.stringify(content, null, 2))
}
const getProjectDir = hook.findProjectDir;

const getPackageJsonPath = projectDir => resolve(projectDir, "package.json");

const isAndroid = platform => /android/i.test(platform);
const isIos = platform => /ios/i.test(platform);

function getAppPathFromProjectData(data) {
    return safeGet(data, PROJECT_DATA_GETTERS.appPath);
}

function getAppResourcesPathFromProjectData(data) {
    return safeGet(data, PROJECT_DATA_GETTERS.appResourcesPath);
}

function safeGet(object, property, ...args) {
    if (!object) {
        return;
    }

    const value = object[property];
    if (!value) {
        return;
    }

    return typeof value === "function" ?
        value.bind(object)(...args) :
        value;
}

module.exports = {
    getAppPathFromProjectData,
    getAppResourcesPathFromProjectData,
    getPackageJson,
    getProjectDir,
    getWebpackConfig,
    isAndroid,
    isIos,
    isAngular,
    isSass,
    isTypeScript,
    writePackageJson,
};
