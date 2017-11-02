const path = require("path");
const { existsSync } = require("fs");
const semver = require("semver");

const { getPackageJson, getProjectDir, isAngular, getAndroidRuntimeVersion } = require("./projectHelpers");

const PROJECT_DIR = getProjectDir({ nestingLvl: 2 });
const APP_DIR = path.join(PROJECT_DIR, "app");

Object.assign(exports, require('./plugins'));

if (isAngular({ projectDir: PROJECT_DIR })) {
    Object.assign(exports, require('./plugins/angular'));
}

exports.uglifyMangleExcludes = require("./mangle-excludes");

exports.getEntryModule = function () {
    const maybePackageJsonEntry = getPackageJsonEntry();
    if (!maybePackageJsonEntry) {
        throw new Error("app/package.json must contain a `main` attribute.");
    }

    const maybeAotEntry = getAotEntry(maybePackageJsonEntry);
    return maybeAotEntry || maybePackageJsonEntry;
};

exports.getAppPath = platform => {
    if (/ios/i.test(platform)) {
        const appName = path.basename(PROJECT_DIR);
        const sanitizedName = sanitize(appName);

        return `platforms/ios/${sanitizedName}/app`;
    } else if (/android/i.test(platform)) {
        const androidPackageVersion = getAndroidRuntimeVersion(PROJECT_DIR);
        const RESOURCES_PATH = "src/main/assets/app";
        const PROJECT_ROOT_PATH = "platforms/android";

        const appPath = semver.lt(androidPackageVersion, "3.4.0") ?
            path.join(PROJECT_ROOT_PATH, RESOURCES_PATH) :
            path.join(PROJECT_ROOT_PATH, "app", RESOURCES_PATH);

        return path.join(PROJECT_DIR, appPath);
    } else {
        throw new Error(`Invalid platform: ${platform}`);
    }
};

const sanitize = name => name
    .split("")
    .filter(char => /[a-zA-Z0-9]/.test(char))
    .join("");

function getPackageJsonEntry() {
    const packageJsonSource = getPackageJson(APP_DIR);
    const entry = packageJsonSource.main;

    return entry ? entry.replace(/\.js$/i, "") : null;
}

function getAotEntry(entry) {
    const aotEntry = `${entry}.aot.ts`;
    const aotEntryPath = path.join(APP_DIR, aotEntry);

    return existsSync(aotEntryPath) ? aotEntry : null;
}
