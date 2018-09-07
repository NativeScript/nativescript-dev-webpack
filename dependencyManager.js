const { isAngular } = require("./projectHelpers");

const NEW_DEPS_MESSAGE = `\
A few new dependencies were added. \
Run "npm install" before building your project.
`;

const ALREADY_ADDED_MESSAGE = `\
Some dependencies have already been added. \
If you want to force update them, please run "node_modules/.bin/update-ns-webpack".
`;

const USAGE_MESSAGE = `
NativeScript Webpack plugin was successfully added.
You can now bundle your project by passing --bundle flag to NativeScript CLI commands:
    - tns build android --bundle
    - tns build ios --bundle
    - tns run android --bundle
    - tns run ios --bundle
You can also pass the "--env.uglify" flag to use UglifyJS for minification.
For more information check out https://docs.nativescript.org/tooling/bundling-with-webpack#bundling.
`;

function addProjectDeps(packageJson, force = false) {
    packageJson.devDependencies = packageJson.devDependencies || {};
    const postinstallOptions = {
        deps: Object.assign({}, packageJson.devDependencies),
    };

    const depsToAdd = getRequiredDeps(packageJson);
    Object.keys(depsToAdd).forEach(function(name) {
        const version = depsToAdd[name];
        Object.assign(postinstallOptions,
            addDependency(postinstallOptions.deps, name, version, force));
    });

    return postinstallOptions;
}

function forceUpdateProjectDeps(packageJson) {
    removeObsoleteDeps(packageJson);

    return addProjectDeps(packageJson, true);
}

function removeObsoleteDeps(packageJson) {
    const depsToRemove = [
        "webpack",
        "webpack-cli",
        "webpack-bundle-analyzer",
        "webpack-sources",
        "clean-webpack-plugin",
        "copy-webpack-plugin",
        "raw-loader",
        "css-loader",
        "nativescript-worker-loader",
        "extract-text-webpack-plugin",
        "uglifyjs-webpack-plugin",
        "@angular-devkit/core",
        "resolve-url-loader",
        "awesome-typescript-loader",
        "sass-loader",
    ];

    depsToRemove.forEach(dep => delete packageJson.devDependencies[dep]);
}

function addDependency(deps, name, version, force) {
    const options = { deps };

    if (!deps[name] || force) {
        deps[name] = version;
        options.newDepsAdded = true;
        console.info(`Adding dev dependency: ${name}@${version}`);
    } else if (deps[name] !== version) {
        options.hasOldDeps = true;
        console.info(`Dev dependency: ${name} already added. Leaving version: ${deps[name]}`);
    }

    return options;
}

function getRequiredDeps(packageJson) {
    if (!isAngular({packageJson})) {
        return false;
    }

    const deps = {
       "@angular/compiler-cli": "~6.1.0",
    };

    if (!dependsOn(packageJson, "@angular-devkit/build-angular")) {
        deps["@ngtools/webpack"] = "~6.2.0";
    }

    return deps;
}


function dependsOn(packageJson, package) {
    if (!packageJson) {
        return false;
    }

    return packageJson.dependencies.hasOwnProperty(package) ||
        packageJson.devDependencies.hasOwnProperty(package);
}

function showHelperMessages({ newDepsAdded, hasOldDeps }) {
    console.info(USAGE_MESSAGE);

    if (hasOldDeps) {
        console.info(ALREADY_ADDED_MESSAGE);
    }

    if (newDepsAdded) {
        console.info(NEW_DEPS_MESSAGE);
    }
}

module.exports = {
    addProjectDeps,
    forceUpdateProjectDeps,
    showHelperMessages,
};
