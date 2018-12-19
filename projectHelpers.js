const { resolve } = require("path");
const fs = require("fs");

const hook = require("nativescript-hook")(__dirname);

const PROJECT_DATA_GETTERS = {
    appPath: "getAppDirectoryRelativePath",
    appResourcesPath: "getAppResourcesRelativeDirectoryPath",
};

const isTypeScript = ({ projectDir, packageJson } = {}) => {
    packageJson = packageJson || getPackageJson(projectDir);

    return (
        packageJson.dependencies &&
        (packageJson.dependencies.hasOwnProperty("nativescript-dev-typescript") ||
            packageJson.dependencies.hasOwnProperty("typescript"))
    ) || (
            packageJson.devDependencies &&
            (packageJson.devDependencies.hasOwnProperty("nativescript-dev-typescript") ||
                packageJson.devDependencies.hasOwnProperty("typescript"))
        ) || isAngular({ packageJson });
};

const isAngular = ({ projectDir, packageJson } = {}) => {
    packageJson = packageJson || getPackageJson(projectDir);

    return packageJson.dependencies && Object.keys(packageJson.dependencies)
        .some(dependency => /^@angular\b/.test(dependency));
};

const isVue = ({ projectDir, packageJson } = {}) => {
    packageJson = packageJson || getPackageJson(projectDir);

    return packageJson.dependencies && Object.keys(packageJson.dependencies)
        .some(dependency => dependency === "nativescript-vue");
};

const getPackageJson = projectDir => {
    const packageJsonPath = getPackageJsonPath(projectDir);
    return JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
};

const writePackageJson = (content, projectDir) => {
    const packageJsonPath = getPackageJsonPath(projectDir);
    const currentJsonContent = fs.readFileSync(packageJsonPath);
    const indentation = getIndentationCharacter(currentJsonContent);
    const stringifiedContent = JSON.stringify(content, null, indentation);
    const currentPackageJsonContent = JSON.parse(currentJsonContent);

    if (JSON.stringify(currentPackageJsonContent, null, indentation) !== stringifiedContent) {
        fs.writeFileSync(packageJsonPath, stringifiedContent)
    }
}

const getIndentationCharacter = (jsonContent) => {
    const matches = jsonContent && jsonContent.toString().match(/{\r*\n*(\W*)"/m);
    return matches && matches[1];
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

// Convert paths from C:\some\path to C:/some/path in order to be required
function convertSlashesInPath(modulePath) {
    if (isWindows) {
        modulePath = modulePath.replace(/\\/g, "/");
    }
    return modulePath;
}

const isWindows = process.platform.startsWith("win32");

module.exports = {
    getAppPathFromProjectData,
    getAppResourcesPathFromProjectData,
    getPackageJson,
    getProjectDir,
    isAndroid,
    isIos,
    isAngular,
    isVue,
    isTypeScript,
    writePackageJson,
    convertSlashesInPath,
    getIndentationCharacter,
    safeGet,
};