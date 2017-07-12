const { isAngular, isTypeScript } = require("./projectHelpers");

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
You can now bundle your project with the following npm scripts:
    - "npm run build-android-bundle" to build for android.
    - "npm run build-ios-bundle" to build for ios.
    - "npm run start-android-bundle" to run on android.
    - "npm run start-ios-bundle" to run on ios.
You can also pass the "--uglify" flag to use UglifyJS for minification.
For more information check out https://docs.nativescript.org/tooling/bundling-with-webpack#bundling.
`;

function forceUpdateProjectDeps(packageJson) {
    return addProjectDeps(packageJson, true);
}

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
    const deps = {
        "webpack": "~3.2.0",
        "webpack-bundle-analyzer": "^2.8.2",
        "webpack-sources": "~1.0.1",
        "copy-webpack-plugin": "~4.0.1",
        "raw-loader": "~0.5.1",
        "nativescript-css-loader": "~0.26.0",
        "resolve-url-loader": "~2.1.0",
        "extract-text-webpack-plugin": "~3.0.0",
    };

    if (isAngular({packageJson})) {
        const angularDeps = resolveAngularDeps(packageJson.dependencies);
        Object.assign(deps, angularDeps);
    } else if (isTypeScript({packageJson})) {
        Object.assign(deps, { "awesome-typescript-loader": "~3.1.3" });
    }

    return deps;
}

function resolveAngularDeps(usedDependencies) {
    const depsToAdd = {
        "@angular/compiler-cli": usedDependencies["@angular/core"],
    };
    const tnsModulesVersion = getVersionWithoutPatch(usedDependencies["tns-core-modules"]);
    const angularCoreVersion = getVersionWithoutPatch(usedDependencies["@angular/core"]);

    if (angularCoreVersion.startsWith("2.")) {
        Object.assign(depsToAdd, {
            "typescript": "~2.1.6",
            "@ngtools/webpack": "1.2.10",
        });
    } else if (tnsModulesVersion.startsWith("2.")) {
         Object.assign(depsToAdd, {
            "typescript": "~2.1.6",
            "@ngtools/webpack": "1.2.13",
        });
    } else {
          Object.assign(depsToAdd, {
            "typescript": "~2.3.4",
            "@ngtools/webpack": "~1.5.0",
        });
    }

    return depsToAdd; 
}

function getVersionWithoutPatch(fullVersion) {
    if (!fullVersion) {
        return "";
    }
    
    const prereleaseVersions = Object.freeze(["next", "latest", "rc"]);
    if (prereleaseVersions.includes(fullVersion)) {
        return fullVersion;
    }

    const version = fullVersion.substring(0, fullVersion.lastIndexOf("."));

    return version.startsWith("~") || version.startsWith("^") ?
        version.substring(1) :
        version;
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
