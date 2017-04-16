const path = require("path");
const fs = require("fs");

const helpers = require("./projectHelpers");

function addProjectFiles(projectDir, appDir) {
    const projectTemplates = getProjectTemplates(projectDir);
    Object.keys(projectTemplates).forEach(function(templateName) {
        const templateDestination = projectTemplates[templateName];
        templateName = path.resolve(templateName)
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

function deleteFile(destinationPath) {
    if (fs.existsSync(destinationPath)) {
        console.info(`Deleting file: ${destinationPath}`);
        fs.unlink(destinationPath);
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
    let templates = {
        "webpack.android.js.template": "webpack.android.js",
        "webpack.ios.js.template": "webpack.ios.js",
    };

    if (helpers.isAngular({projectDir})) {
        templates["webpack.common.js.angular.template"] = "webpack.common.js";
        templates["tsconfig.aot.json.template"] = "tsconfig.aot.json";
    } else if (helpers.isTypeScript({projectDir})) {
        templates["webpack.common.js.typescript.template"] = "webpack.common.js";
    } else {
        templates["webpack.common.js.javascript.template"] = "webpack.common.js";
    }

    return getFullTemplatesPath(projectDir, templates);
}

function getAppTemplates(projectDir, appDir) {
    const templates = {
        "vendor-platform.android.ts.template": tsOrJs(projectDir, "vendor-platform.android"),
        "vendor-platform.ios.ts.template": tsOrJs(projectDir, "vendor-platform.ios"),
    };

    if (helpers.isAngular({projectDir})) {
        templates["vendor.ts.angular.template"] = tsOrJs(projectDir, "vendor");
    } else {
        templates["vendor.ts.nativescript.template"] = tsOrJs(projectDir, "vendor");
    }

    return getFullTemplatesPath(appDir, templates);
}

function getFullTemplatesPath(projectDir, templates) {
    let updatedTemplates = {};

    Object.keys(templates).forEach(key => {
        const updatedKey = getFullPath(__dirname, key);
        const updatedValue = getFullPath(projectDir, templates[key])

        updatedTemplates[updatedKey] = updatedValue;
    });

    return updatedTemplates;
}

function getFullPath(projectDir, filePath) {
    return path.resolve(projectDir, filePath);
}

function tsOrJs(projectDir, name) {
    const extension = helpers.isTypeScript({projectDir}) ? "ts" : "js";
    return `${name}.${extension}`;
}

module.exports = {
    addProjectFiles,
    removeProjectFiles,
};
