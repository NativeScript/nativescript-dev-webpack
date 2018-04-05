const path = require("path");
const fs = require("fs");

const { isTypeScript, isAngular } = require("./projectHelpers");

function addProjectFiles(projectDir, appDir) {
    const projectTemplates = getProjectTemplates(projectDir);
    Object.keys(projectTemplates).forEach(function(templateName) {
        const templateDestination = projectTemplates[templateName];
        templateName = path.resolve(templateName);
        copyTemplate(templateName, templateDestination);
    });

    const appTemplates = getAppTemplates(projectDir, appDir);
    Object.keys(appTemplates).forEach(function(templateName) {
        const templateDestination = appTemplates[templateName];
        copyTemplate(templateName, templateDestination)
    });
}

function removeProjectFiles(projectDir, appDir) {
    const projectTemplates = getProjectTemplates(projectDir);
    Object.keys(projectTemplates).forEach(function(templateName) {
        const templateDestination = projectTemplates[templateName];
        deleteFile(templateDestination);
    });

    const appTemplates = getAppTemplates(projectDir, appDir);
    Object.keys(appTemplates).forEach(function(templateName) {
        const templateDestination = appTemplates[templateName];
        deleteFile(templateDestination);
    });
}

function forceUpdateProjectFiles(projectDir, appDir) {
    removeProjectFiles(projectDir, appDir);
    addProjectFiles(projectDir, appDir);
}

function compareProjectFiles(projectDir) {
    const projectTemplates = getProjectTemplates(projectDir);
    Object.keys(projectTemplates).forEach(newTemplatePath => {
        const currentTemplatePath = projectTemplates[newTemplatePath];
        if (fs.existsSync(currentTemplatePath)) {
            const currentTemplate = fs.readFileSync(currentTemplatePath).toString();
            const newTemplate = fs.readFileSync(newTemplatePath).toString();
            if (newTemplate !== currentTemplate) {
                const message = `The current project contains a ${path.basename(currentTemplatePath)} file located at ${currentTemplatePath} that differs from the one in the new version of the nativescript-dev-webpack plugin located at ${newTemplatePath}. Some of the plugin features may not work as expected until you manually update the ${path.basename(currentTemplatePath)} file or automatically update it using "./node_modules/.bin/update-ns-webpack --configs" command.`;
                console.info(`\x1B[33;1m${message}\x1B[0m` );
            }
        }
    });
}

function deleteFile(destinationPath) {
    if (fs.existsSync(destinationPath)) {
        console.info(`Deleting file: ${destinationPath}`);
        fs.unlinkSync(destinationPath);
    }
}

function copyTemplate(templateName, destinationPath) {
    // Create destination file, only if not present.
    if (!fs.existsSync(destinationPath)) {
        console.info(`Creating file: ${destinationPath}`);
        const content = fs.readFileSync(templateName, "utf8");
        fs.writeFileSync(destinationPath, content);
    }
}

function getProjectTemplates(projectDir) {
    let templates = {}

    if (isAngular({projectDir})) {
        templates["webpack.angular.js"] = "webpack.config.js";
    } else if (isTypeScript({projectDir})) {
        templates["webpack.typescript.js"] = "webpack.config.js";
    } else {
        templates["webpack.javascript.js"] = "webpack.config.js";
    }

    return getFullTemplatesPath(projectDir, templates);
}

function getAppTemplates(projectDir, appDir) {
    const templates = {
        "vendor-platform.android.ts": tsOrJs(projectDir, "vendor-platform.android"),
        "vendor-platform.ios.ts": tsOrJs(projectDir, "vendor-platform.ios"),
    };

    if (isAngular({projectDir})) {
        templates["vendor.angular.ts"] = tsOrJs(projectDir, "vendor");
    } else {
        templates["vendor.nativescript.ts"] = tsOrJs(projectDir, "vendor");
    }

    return getFullTemplatesPath(appDir, templates);
}

function getFullTemplatesPath(projectDir, templates) {
    let updatedTemplates = {};

    Object.keys(templates).forEach(key => {
        const updatedKey = getFullPath(path.join(__dirname, "templates"), key);
        const updatedValue = getFullPath(projectDir, templates[key])

        updatedTemplates[updatedKey] = updatedValue;
    });

    return updatedTemplates;
}

function getFullPath(projectDir, filePath) {
    return path.resolve(projectDir, filePath);
}

function tsOrJs(projectDir, name) {
    const extension = isTypeScript({projectDir}) ? "ts" : "js";
    return `${name}.${extension}`;
}

module.exports = {
    addProjectFiles,
    removeProjectFiles,
    forceUpdateProjectFiles,
    compareProjectFiles,
};

