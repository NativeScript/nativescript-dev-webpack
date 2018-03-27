const path = require("path");
const { existsSync } = require("fs");

const {
    APP_DIR,
    getPackageJson,
    getProjectDir,
    isAngular,
    isAndroid,
    isIos,
    resolveAndroidAppPath,
} = require("./projectHelpers");

const PROJECT_DIR = getProjectDir();
const APP_PATH = path.join(PROJECT_DIR, APP_DIR);

Object.assign(exports, require('./plugins'));

if (isAngular({ projectDir: PROJECT_DIR })) {
    Object.assign(exports, require('./plugins/angular'));
}

exports.getAotEntryModule = function (appDirectory = APP_PATH) {
    const entry = getPackageJsonEntry(appDirectory);
    const aotEntry = `${entry}.aot.ts`;

    const aotEntryPath = path.resolve(appDirectory, aotEntry);
    if (!existsSync(aotEntryPath)) {
        throw new Error(`For ahead-of-time compilation you need to have an entry module ` +
        `at ${aotEntryPath} that bootstraps the app with a static platform instead of dynamic one!`)
    }

    return aotEntry;
}

// Exported for backwards compatibility with {N} 3
exports.uglifyMangleExcludes = require("./mangle-excludes");

exports.getEntryModule = function (appDirectory = APP_PATH) {
    const entry = getPackageJsonEntry(appDirectory);

    const tsEntryPath = path.resolve(appDirectory, `${entry}.ts`);
    const jsEntryPath = path.resolve(appDirectory, `${entry}.js`);
    if (!existsSync(tsEntryPath) && !existsSync(jsEntryPath)) {
        throw new Error(`The entry module ${entry} specified in ` +
        `${appDirectory}/package.json doesn't exist!`)
    }

    return entry;
};

exports.getAppPath = platform => {
    if (isIos(platform)) {
        const appName = path.basename(PROJECT_DIR);
        const sanitizedName = sanitize(appName);

        return `platforms/ios/${sanitizedName}/app`;
    } else if (isAndroid(platform)) {
        return resolveAndroidAppPath(PROJECT_DIR);
    } else {
        throw new Error(`Invalid platform: ${platform}`);
    }
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
