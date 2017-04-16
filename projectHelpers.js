const path = require("path");
const fs = require("fs");

const isTypeScript = ({projectDir, packageJson} = {}) => {
    packageJson = packageJson || getPackageJson(projectDir);

    return packageJson.dependencies.hasOwnProperty("typescript") ||
        packageJson.devDependencies.hasOwnProperty("typescript") ||
        isAngular({packageJson});
};

const isAngular = ({projectDir, packageJson} = {}) => {
    packageJson = packageJson || getPackageJson(projectDir);

    return Object.keys(packageJson.dependencies)
        .some(dependency => /^@angular\b/.test(dependency));
};

const getPackageJson = projectDir => {
    const packageJsonPath = getPackageJsonPath(projectDir);
    return JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
};

const writePackageJson = (content, projectDir) => {
    const packageJsonPath = getPackageJsonPath(projectDir);
    fs.writeFileSync(packageJsonPath, JSON.stringify(content, null, 2))
}

const getPackageJsonPath = projectDir => path.resolve(projectDir, "package.json");

module.exports = {
    isTypeScript,
    isAngular,
    getPackageJson,
    writePackageJson,
};
