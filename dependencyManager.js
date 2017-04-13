const helpers = require("./projectHelpers");

function forceUpdateProjectDeps(packageJson) {
    addProjectDeps(packageJson, true);
}

function addProjectDeps(packageJson, force = false) {
    const depsToAdd = getRequiredDeps(packageJson);
    packageJson.devDependencies = packageJson.devDependencies || {};
    let oldDeps = packageJson.devDependencies;

    let alreadyAdded = false;
    Object.keys(depsToAdd).forEach(function(name) {
        const version = depsToAdd[name];
        alreadyAdded = addDependency(oldDeps, name, version, force) || alreadyAdded;
    });

    if (alreadyAdded) {
        console.error("Some deps were not updated because they were already added.");
        console.error("If you want to force update them, please run './node_modules/.bin/ns-webpack-update'");
    }
}

function addDependency(deps, name, version, force) {
    if (!deps[name] || force) {
        deps[name] = version;
        console.info(`Adding dev dependency: ${name}@${version}`);
        return false;
    } else {
        console.info(`Dev dependency: ${name} already added. Leaving version: ${deps[name]}`);
        return true;
    }
}

function getRequiredDeps(packageJson) {
    var deps = {
        "webpack": "~2.3.3",
        "webpack-sources": "~0.2.3",
        "copy-webpack-plugin": "~4.0.1",
        "raw-loader": "~0.5.1",
        "nativescript-css-loader": "~0.26.0",
        "resolve-url-loader": "~2.0.2",
        "extract-text-webpack-plugin": "~2.1.0",
    };

    if (helpers.isAngular({packageJson})) {
        deps["@angular/compiler-cli"] = "~4.0.2";
        deps["@ngtools/webpack"] = "1.3.0";
        deps["typescript"] = "~2.2.2";
    } else if (helpers.isTypeScript({packageJson})) {
        deps["awesome-typescript-loader"] = "~3.1.2";
    }
    return deps;
}

module.exports = {
    forceUpdateProjectDeps,
    addProjectDeps,
};
