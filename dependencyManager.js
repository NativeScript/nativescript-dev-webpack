const helpers = require("./projectHelpers");

const NEW_DEPS_MESSAGE = `
A few development dependencies were added. \
Install them before bundling your project.`;

const ALREADY_ADDED_MESSAGE = `\
Some dependencies may have already been added. \
If you want to force update them, please run "node_modules/.bin/update-ns-webpack".`;

function forceUpdateProjectDeps(packageJson) {
    return addProjectDeps(packageJson, true);
}

function addProjectDeps(packageJson, force = false) {
    const depsToAdd = getRequiredDeps(packageJson);
    packageJson.devDependencies = packageJson.devDependencies || {};
    let deps = Object.assign({}, packageJson.devDependencies);

    Object.keys(depsToAdd).forEach(function(name) {
        const version = depsToAdd[name];
        deps = addDependency(deps, name, version, force);
    });

    logHelperMessages();

    return deps;
}

function addDependency(deps, name, version, force) {
    if (!deps[name] || force) {
        deps[name] = version;
        console.info(`Adding dev dependency: ${name}@${version}`);
    } else if (deps[name] !== version) {
        console.info(`Dev dependency: ${name} already added. Leaving version: ${deps[name]}`);
    }

    return deps;
}

function getRequiredDeps(packageJson) {
    let deps = {
        "webpack": "~2.5.1",
        "webpack-sources": "~0.2.3",
        "copy-webpack-plugin": "~4.0.1",
        "raw-loader": "~0.5.1",
        "nativescript-css-loader": "~0.26.0",
        "resolve-url-loader": "~2.0.2",
        "extract-text-webpack-plugin": "~2.1.0",
    };

    if (helpers.isAngular({packageJson})) {
        const angularDeps = resolveAngularDeps(packageJson.dependencies);
        deps = Object.assign(deps, angularDeps);
    } else if (helpers.isTypeScript({packageJson})) {
        deps["awesome-typescript-loader"] = "~3.1.3";
    }

    return deps;
}

function resolveAngularDeps(usedDependencies) {
    let depsToAdd = {
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
            "typescript": "~2.3.2",
            "@ngtools/webpack": "1.3.1",
        });
    }

    return depsToAdd; 
}

function getVersionWithoutPatch(version) {
    if (!version) {
        return "";
    }
    
    if (version === "next" || version === "latest" || version === "rc") {
        return version;
    }

    version = version.substring(0, version.lastIndexOf("."));

    if (version.startsWith("~") || version.startsWith("^")) {
        return version.substring(1);
    } else {
        return version;
    }
}

function logHelperMessages(someAlreadyAdded) {
    console.info(NEW_DEPS_MESSAGE);
    console.info(ALREADY_ADDED_MESSAGE);
}

module.exports = {
    forceUpdateProjectDeps,
    addProjectDeps,
};
