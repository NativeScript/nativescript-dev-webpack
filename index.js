const path = require("path");
const { existsSync } = require("fs");
const { ANDROID_APP_PATH } = require("./androidProjectHelpers");
const {
    getPackageJson,
    isAndroid,
    isIos,
} = require("./projectHelpers");

Object.assign(exports, require("./plugins"));
Object.assign(exports, require("./host/resolver"));

exports.getAotEntryModule = function (appDirectory) {
    verifyEntryModuleDirectory(appDirectory);

    const entry = getPackageJsonEntry(appDirectory);
    const aotEntry = `${entry}.aot.ts`;

    const aotEntryPath = path.resolve(appDirectory, aotEntry);
    if (!existsSync(aotEntryPath)) {
        throw new Error(`For ahead-of-time compilation you need to have an entry module ` +
            `at ${aotEntryPath} that bootstraps the app with a static platform instead of dynamic one!`)
    }

    return aotEntry;
}

exports.getEntryModule = function (appDirectory) {
    verifyEntryModuleDirectory(appDirectory);

    const entry = getPackageJsonEntry(appDirectory);

    const tsEntryPath = path.resolve(appDirectory, `${entry}.ts`);
    const jsEntryPath = path.resolve(appDirectory, `${entry}.js`);
    if (!existsSync(tsEntryPath) && !existsSync(jsEntryPath)) {
        throw new Error(`The entry module ${entry} specified in ` +
            `${appDirectory}/package.json doesn't exist!`)
    }

    return entry;
};

exports.getAppPath = (platform, projectDir) => {
    if (isIos(platform)) {
        const appName = path.basename(projectDir);
        const sanitizedName = sanitize(appName);

        return `platforms/ios/${sanitizedName}/app`;
    } else if (isAndroid(platform)) {
        return ANDROID_APP_PATH;
    } else {
        throw new Error(`Invalid platform: ${platform}`);
    }
};

/**
 * Converts an array of strings externals to an array of regular expressions.
 * Input is an array of string, which we need to convert to regular expressions, so all imports for this module will be treated as externals.

 * For example, in case we want nativescript-vue to be external, we will pass `["nativescript-vue"]`.
 * If we pass it to webpack in this way, it will treat all `require("nativescript-vue")` as externals.
 * However, you may import some file/subdir of the module, for example `require("nativescript-vue/somedir/file1")`.
 * To treat this as external, we convert the strings to regular expressions, which makes webpack exclude all imports of the module.
 * @param {string[]} externals Array of strings.
 * @returns {RegExp[]} Array of regular expressions constructed from the input strings. In case the input is nullable, an empty array is returned.
 */
exports.getConvertedExternals = (externals) => {
    const modifiedExternals = (externals || []).map((e) => {
        return new RegExp(`^${e}((/.*)|$)`);
    });

    return modifiedExternals;
};

const sanitize = name => name
    .split("")
    .filter(char => /[a-zA-Z0-9]/.test(char))
    .join("");

function getPackageJsonEntry(appDirectory) {
    const packageJsonSource = getPackageJson(appDirectory);
    const entry = packageJsonSource.main;

    if (!entry) {
        throw new Error(`${appDirectory}/package.json must contain a 'main' attribute!`);
    }

    return entry.replace(/\.js$/i, "");
}

function verifyEntryModuleDirectory(appDirectory) {
    if (!appDirectory) {
        throw new Error("Path to app directory is not specified. Unable to find entry module.");
    }

    if (!existsSync(appDirectory)) {
        throw new Error(`The specified path to app directory ${appDirectory} does not exist. Unable to find entry module.`);
    }
}
