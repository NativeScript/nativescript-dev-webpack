var path = require("path");
var fs = require("fs");
var childProcess = require("child_process");

var projectDir = path.dirname(path.dirname(__dirname));
var appDir = path.join(projectDir, "app");

var packageJsonPath = path.join(projectDir, "package.json");
var packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

var isAngular = Object.keys(packageJson.dependencies).filter(function (dependency) {
    return /^@angular\b/.test(dependency);
}).length > 0;

var isTypeScript = fs.existsSync(path.join(projectDir, "tsconfig.json"));
if (isAngular) {
    isTypeScript = true;
}

function getProjectTemplates() {
    var templates = {
        "webpack.android.js.template": "webpack.android.js",
        "webpack.ios.js.template": "webpack.ios.js",
    };

    if (isAngular) {
        templates["webpack.common.js.angular.template"] = "webpack.common.js";
        templates["tsconfig.aot.json.template"] = "tsconfig.aot.json";
    } else {
        templates["webpack.common.js.nativescript.template"] = "webpack.common.js";
    }
    return templates;
}

function getAppTemplates() {
    var templates = {
        "vendor-platform.android.ts.template": tsOrJs("vendor-platform.android"),
        "vendor-platform.ios.ts.template": tsOrJs("vendor-platform.ios"),
    };

    if (isAngular) {
        templates["vendor.ts.angular.template"] = tsOrJs("vendor");
    } else {
        templates["vendor.ts.nativescript.template"] = tsOrJs("vendor");
    }
    return templates;
}

function addProjectFiles() {
    var projectTemplates = getProjectTemplates();
    Object.keys(projectTemplates).forEach(function(templateName) {
        var templateDestination = projectTemplates[templateName];
        copyProjectTemplate(templateName, templateDestination);
    });

    var appTemplates = getAppTemplates();
    Object.keys(appTemplates).forEach(function(templateName) {
        var templateDestination = appTemplates[templateName];
        copyAppTemplate(templateName, templateDestination);
    });
}
exports.addProjectFiles = addProjectFiles;

function removeProjectFiles() {
    var projectTemplates = getProjectTemplates();
    Object.keys(projectTemplates).forEach(function(templateName) {
        var templateDestination = projectTemplates[templateName];
        deleteProjectFile(templateDestination);
    });

    var appTemplates = getAppTemplates();
    Object.keys(appTemplates).forEach(function(templateName) {
        var templateDestination = appTemplates[templateName];
        deleteAppFile(templateDestination);
    });
}
exports.removeProjectFiles = removeProjectFiles;

function getScriptTemplates() {
    return {
        "clean-[PLATFORM]": "tns clean-app [PLATFORM]",
        "prewebpack-[PLATFORM]": "npm run clean-[PLATFORM]",
        "webpack-[PLATFORM]": "webpack --config=webpack.[PLATFORM].js --progress",
        "prestart-[PLATFORM]-bundle": "npm run webpack-[PLATFORM]",
        "start-[PLATFORM]-bundle": "tns run [PLATFORM] --bundle --disable-npm-install",
        "prebuild-[PLATFORM]-bundle": "npm run webpack-[PLATFORM]",
        "build-[PLATFORM]-bundle": "tns build [PLATFORM] --bundle --disable-npm-install",
    };
}

function addNpmScripts() {
    var scriptTemplates = getScriptTemplates();
    Object.keys(scriptTemplates).forEach(function(templateName) {
        addPlatformScript(packageJson, templateName, scriptTemplates[templateName]);
    });
}
exports.addNpmScripts = addNpmScripts;

function removeNpmScripts() {
    var scriptTemplates = getScriptTemplates();
    Object.keys(scriptTemplates).forEach(function(templateName) {
        removePlatformScripts(packageJson, templateName);
    });
}
exports.removeNpmScripts = removeNpmScripts;

function getProjectDependencies() {
    var dependencies = {
        "webpack": "2.2.0",
        "webpack-sources": "~0.1.3",
        "copy-webpack-plugin": "~3.0.1",
        "raw-loader": "~0.5.1",
        "nativescript-css-loader": "~0.26.0",
        "resolve-url-loader": "~1.6.0",
        "extract-text-webpack-plugin": "~2.0.0-beta.4",
    };

    if (isAngular) {
        dependencies["@angular/compiler-cli"] = "~2.4.3";
        dependencies["@ngtools/webpack"] = "1.2.4";
        dependencies["typescript"] = "^2.0.10";
        dependencies["htmlparser2"] = "~3.9.2";
    } else {
        dependencies["awesome-typescript-loader"] = "~3.0.0-beta.9";
    }
    return dependencies;
}

function addProjectDependencies() {
    configureDevDependencies(packageJson, function (add) {
        var dependencies = getProjectDependencies();
        Object.keys(dependencies).forEach(function(dependencyName) {
            add(dependencyName, dependencies[dependencyName]);
        });
    });
}
exports.addProjectDependencies = addProjectDependencies;

function removeProjectDependencies() {
    configureDevDependencies(packageJson, function (add, remove) {
        var dependencies = getProjectDependencies();
        Object.keys(dependencies).forEach(function(dependencyName) {
            remove(dependencyName);
        });
    });
}
exports.removeProjectDependencies = removeProjectDependencies;


function addPlatformScript(packageJson, nameTemplate, commandTemplate) {
    if (!packageJson.scripts) {
        packageJson.scripts = {};
    }

    var scripts = packageJson.scripts;
    ["android", "ios"].forEach(function (platform) {
        var name = nameTemplate.replace(/\[PLATFORM\]/g, platform);
        var command = commandTemplate.replace(/\[PLATFORM\]/g, platform);
        if (!scripts[name]) {
            console.log("Registering script: " + name);
            scripts[name] = command;
        }
    });
}

function removePlatformScripts(packageJson, nameTemplate) {
    if (!packageJson.scripts) {
        return;
    }

    var scripts = packageJson.scripts;
    ["android", "ios"].forEach(function (platform) {
        var name = nameTemplate.replace(/\[PLATFORM\]/g, platform);
        console.log("Removing script: " + name);
        delete scripts[name];
    });
}

function configureDevDependencies(packageJson, adderCallback) {
    var pendingNpmInstall = false;
    if (!packageJson.devDependencies) {
        packageJson.devDependencies = {};
    }
    var dependencies = packageJson.devDependencies;

    adderCallback(function (name, version) {
        if (!dependencies[name]) {
            dependencies[name] = version;
            console.info("Adding dev dependency: " + name + "@" + version);
            pendingNpmInstall = true;
        } else {
            console.info("Dev dependency: '" + name + "' already added. Leaving version: " + dependencies[name]);
        }
    }, function(name) {
        console.info("Removing dev dependency: " + name);
        delete dependencies[name];
    });

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    if (pendingNpmInstall) {
        console.info("Installing new dependencies...");
        //Run `npm install` after everything else.
        setTimeout(function () {
            var spawnArgs = [];
            if (/^win/.test(process.platform)) {
                spawnArgs = ["cmd.exe", ["/c", "npm", "install"]];
            } else {
                spawnArgs = ["npm", ["install"]];
            }
            spawnArgs.push({ cwd: projectDir, stdio: "inherit" });
            var npm = childProcess.spawn.apply(null, spawnArgs);
            npm.on("close", function (code) {
                process.exit(code);
            });
        }, 100);
    }
}

function tsOrJs(name) {
    if (isTypeScript) {
        return name + ".ts";
    } else {
        return name + ".js";
    }
}

function copyProjectTemplate(templateName, projectPath) {
    var destinationPath = path.join(projectDir, projectPath);
    copyTemplate(templateName, destinationPath);
}

function deleteProjectFile(projectPath) {
    var destinationPath = path.join(projectDir, projectPath);
    deleteFile(destinationPath);
}

function copyAppTemplate(templateName, appPath) {
    var destinationPath = path.join(appDir, appPath);
    copyTemplate(templateName, destinationPath);
}

function deleteAppFile(appPath) {
    var destinationPath = path.join(appDir, appPath);
    deleteFile(destinationPath);
}

function deleteFile(destinationPath) {
    if (fs.existsSync(destinationPath)) {
        console.log("Deleting file: " + destinationPath);
        fs.unlink(destinationPath);
    }
}

function copyTemplate(templateName, destinationPath) {
    var templatePath = path.join(__dirname, templateName);
    // Create destination file, only if not present.
    if (!fs.existsSync(destinationPath)) {
        console.log("Creating file: " + destinationPath);
        var content = fs.readFileSync(templatePath, "utf8");
        fs.writeFileSync(destinationPath, content);
    }
}
