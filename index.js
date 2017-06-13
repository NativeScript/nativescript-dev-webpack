const path = require("path");
const { existsSync } = require("fs");

const { getPackageJson, isAngular } = require("./projectHelpers");
const { sanitize } = require("./utils");

const PROJECT_DIR = path.dirname(path.dirname(__dirname));
const APP_DIR = path.join(PROJECT_DIR, "app");

Object.assign(exports, require('./plugins'));

if (isAngular({projectDir: PROJECT_DIR})) {
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
        return path.join(PROJECT_DIR, "platforms/android/src/main/assets/app");
    } else {
        throw new Error(`Invalid platform: ${platform}`);
    }
};

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
