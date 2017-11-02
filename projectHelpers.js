const path = require("path");
const fs = require("fs");

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

const getAndroidRuntimeVersion = (projectDir) => {
    try {
        const projectPackageJSON = getPackageJson(projectDir);

        return projectPackageJSON["nativescript"]["tns-android"]["version"];
    } catch (e) {
        return null;
    }
}

const getPackageJson = projectDir => {
    const packageJsonPath = getPackageJsonPath(projectDir);
    return JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
};

const writePackageJson = (content, projectDir) => {
    const packageJsonPath = getPackageJsonPath(projectDir);
    fs.writeFileSync(packageJsonPath, JSON.stringify(content, null, 2))
}
const getProjectDir = ({ nestingLvl } = { nestingLvl: 0 }) => {
    // INIT_CWD is available since npm 5.4
    const initCwd = process.env.INIT_CWD;
    const shouldUseInitCwd = (() => {
        if (!initCwd) {
            return false;
        }

        const installedPackage = path.resolve(initCwd, "node_modules", "nativescript-dev-webpack");
        if (!fs.existsSync(installedPackage)) {
            return false;
        }

        const stat = fs.lstatSync(installedPackage);
        return stat.isSymbolicLink();
    })();

    return shouldUseInitCwd ?
        initCwd :
        Array
            .from(Array(nestingLvl))
            .reduce(dir => path.dirname(dir), __dirname);
};

const getPackageJsonPath = projectDir => path.resolve(projectDir, "package.json");

module.exports = {
    isTypeScript,
    isAngular,
    writePackageJson,
    getPackageJson,
    getProjectDir,
    getAndroidRuntimeVersion,
};
