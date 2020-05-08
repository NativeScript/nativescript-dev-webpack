const path = require("path");
const fs = require("fs");

const { isTypeScript, isAngular, isVue, isShared } = require("./projectHelpers");

function addProjectFiles(projectDir) {
    const projectTemplates = getProjectTemplates(projectDir);
    Object.keys(projectTemplates).forEach(function (templateName) {
        const templateDestination = projectTemplates[templateName];
        templateName = path.resolve(templateName);
        copyTemplate(templateName, templateDestination);
    });
}

function removeProjectFiles(projectDir) {
    const projectTemplates = getProjectTemplates(projectDir);
    Object.keys(projectTemplates).forEach(function (templateName) {
        const templateDestination = projectTemplates[templateName];
        deleteFile(templateDestination);
    });
}

function forceUpdateProjectFiles(projectDir) {
    removeProjectFiles(projectDir);
    addProjectFiles(projectDir);
}

function compareProjectFiles(projectDir) {
    const projectTemplates = getProjectTemplates(projectDir);
    Object.keys(projectTemplates).forEach(newTemplatePath => {
        const currentTemplatePath = projectTemplates[newTemplatePath];
        if (fs.existsSync(currentTemplatePath)) {
            const currentTemplate = fs.readFileSync(currentTemplatePath).toString();
            const newTemplate = fs.readFileSync(newTemplatePath).toString();
            if (newTemplate.replace(/\s/g, '') !== currentTemplate.replace(/\s/g, '')) {
                const message = `The current project contains a ${path.basename(currentTemplatePath)} file located at ${currentTemplatePath} that differs from the one in the new version of the nativescript-dev-webpack plugin located at ${newTemplatePath}. Some of the plugin features may not work as expected until you manually update the ${path.basename(currentTemplatePath)} file or automatically update it using "./node_modules/.bin/update-ns-webpack --configs" command.`;
                console.info(`\x1B[33;1m${message}\x1B[0m`);
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
    const WEBPACK_CONFIG_NAME = "webpack.config.js";
    const TSCONFIG_TNS_NAME = "tsconfig.tns.json";

    let templates;
    if (isAngular({ projectDir })) {
        if (isShared({ projectDir })) {
            templates = getSharedAngularTemplates(WEBPACK_CONFIG_NAME);
        } else {
            templates = getAngularTemplates(WEBPACK_CONFIG_NAME, TSCONFIG_TNS_NAME);
        }
    } else if (isVue({ projectDir })) {
        templates = getVueTemplates(WEBPACK_CONFIG_NAME);
    } else if (isTypeScript({ projectDir })) {
        templates = getTypeScriptTemplates(WEBPACK_CONFIG_NAME, TSCONFIG_TNS_NAME);
    } else {
        templates = getJavaScriptTemplates(WEBPACK_CONFIG_NAME);
    }

    return getFullTemplatesPath(projectDir, templates);
}

function getSharedAngularTemplates(webpackConfigName) {
    return {
        "webpack.angular.js": webpackConfigName,
    };
}

function getAngularTemplates(webpackConfigName, tsconfigName) {
    return {
        "webpack.angular.js": webpackConfigName,
        [tsconfigName]: tsconfigName,
    };
}

function getTypeScriptTemplates(webpackConfigName, tsconfigName) {
    return {
        "webpack.typescript.js": webpackConfigName,
        [tsconfigName]: tsconfigName,
    };
}

function getVueTemplates(webpackConfigName) {
    return {
        "webpack.vue.js": webpackConfigName
    };
}

function getJavaScriptTemplates(webpackConfigName) {
    return {
        "webpack.javascript.js": webpackConfigName,
    };
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

module.exports = {
    addProjectFiles,
    removeProjectFiles,
    forceUpdateProjectFiles,
    compareProjectFiles,
};