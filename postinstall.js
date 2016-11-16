var path = require("path");
var fs = require("fs");
var childProcess = require("child_process");

var projectDir = path.dirname(path.dirname(__dirname));
var appDir = path.join(projectDir, "app");

var packageJsonPath = path.join(projectDir, "package.json");
var packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

var isAngular = Object.keys(packageJson.dependencies).filter(function(dependency) {
    return /^@angular\b/.test(dependency);
}).length > 0;

var isTypeScript = fs.existsSync(path.join(projectDir, "tsconfig.json"));
if (isAngular) {
    isTypeScript = true;
}

copyProjectTemplate("webpack.common.js.template", "webpack.common.js");
copyProjectTemplate("webpack.android.js.template", "webpack.android.js");
copyProjectTemplate("webpack.ios.js.template", "webpack.ios.js");

if (isAngular) {
    copyAppTemplate("vendor.ts.angular.template", tsOrJs("vendor"));
} else {
    copyAppTemplate("vendor.ts.nativescript.template", tsOrJs("vendor"));
}

copyAppTemplate("vendor-platform.android.ts.template", tsOrJs("vendor-platform.android"));
copyAppTemplate("vendor-platform.ios.ts.template", tsOrJs("vendor-platform.ios"));

addPlatformScript(packageJson, "clean-[PLATFORM]", "tns clean-app [PLATFORM]");
addPlatformScript(packageJson, "prewebpack-[PLATFORM]", "npm run clean-[PLATFORM]");
addPlatformScript(packageJson, "webpack-[PLATFORM]", "webpack --config=webpack.[PLATFORM].js --progress");
addPlatformScript(packageJson, "prestart-[PLATFORM]-bundle", "npm run webpack-[PLATFORM]");
addPlatformScript(packageJson, "start-[PLATFORM]-bundle", "tns run [PLATFORM] --bundle --disable-npm-install");
addPlatformScript(packageJson, "prebuild-[PLATFORM]-bundle", "npm run webpack-[PLATFORM]");
addPlatformScript(packageJson, "build-[PLATFORM]-bundle", "tns build [PLATFORM] --bundle --disable-npm-install");

configureDevDependencies(packageJson, function(add) {
    add("webpack", "~2.1.0-beta.25");
    add("webpack-sources", "~0.1.2");
    add("copy-webpack-plugin", "~3.0.1");
    add("awesome-typescript-loader", "~2.2.4");
    add("html-loader", "~0.4.3");
    add("raw-loader", "~0.5.1");
});

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 4));

function addPlatformScript(packageJson, nameTemplate, commandTemplate) {
    if (!packageJson.scripts) {
        packageJson.scripts = {};
    }

    var scripts = packageJson.scripts;
    ["android", "ios"].forEach(function(platform) {
        var name = nameTemplate.replace(/\[PLATFORM\]/g, platform);
        var command = commandTemplate.replace(/\[PLATFORM\]/g, platform);
        if (!scripts[name]) {
            scripts[name] = command;
            console.log("Registering script: " + name);
        }
    });
}

function configureDevDependencies(packageJson, adderCallback) {
    var pendingNpmInstall = false;
    if (!packageJson.devDependencies) {
        packageJson.devDependencies = {};
    }
    var dependencies = packageJson.devDependencies;

    adderCallback(function(name, version) {
        if (!dependencies[name]) {
            dependencies[name] = version;
            console.info("Adding dev dependency: " + name + "@" + version);
            pendingNpmInstall = true;
        } else {
            console.info("Dev dependency: '" + name + "' already added. Leaving version: " + dependencies[name]);
        }
    });

    if (pendingNpmInstall) {
        console.info("Installing new dependencies...");
        //Run `npm install` after everything else.
        setTimeout(function() {
            var spawnArgs = [];
            if (/^win/.test(process.platform)) {
                spawnArgs = ["cmd.exe", ["/c", "npm", "install"]];
            } else {
                spawnArgs = ["npm", ["install"]];
            }
            spawnArgs.push({ cwd: projectDir, stdio: "inherit" });
            var npm = childProcess.spawn.apply(null, spawnArgs);
            npm.on("close", function(code) {
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

function copyAppTemplate(templateName, appPath) {
    var destinationPath = path.join(appDir, appPath);
    copyTemplate(templateName, destinationPath);
}

function copyTemplate(templateName, destinationPath) {
    var templatePath = path.join(__dirname, templateName);
    // Create destination file, only if not present.
    if (!fs.existsSync(destinationPath)) {
        var content = fs.readFileSync(templatePath, "utf8");
        fs.writeFileSync(destinationPath, content);
    }
}
