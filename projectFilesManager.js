const path = require("path");
const fs = require("fs");

const { isTypeScript, isAngular } = require("./projectHelpers");

const FRAME_MATCH =  /(\s*)(require\("ui\/frame"\);)(\s*)(require\("ui\/frame\/activity"\);)/;
const SCOPED_FRAME = `
if (!global["__snapshot"]) {
    // In case snapshot generation is enabled these modules will get into the bundle
    // but will not be required/evaluated. 
    // The snapshot webpack plugin will add them to the tns-java-classes.js bundle file.
    // This way, they will be evaluated on app start as early as possible.
    $1\t$2$3\t$4
}`;

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
    let templates = {}

    if (isAngular({projectDir})) {
        templates["webpack.angular.js"] = "webpack.config.js";
        templates["tsconfig.aot.json"] = "tsconfig.aot.json";
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

function editExistingProjectFiles(projectDir) {
    const webpackConfigPath = getFullPath(projectDir, "webpack.config.js");
    const webpackCommonPath = getFullPath(projectDir, "webpack.common.js");

    editFileContent(webpackConfigPath, replaceStyleUrlResolvePlugin);
    editFileContent(webpackCommonPath, replaceStyleUrlResolvePlugin);

    const extension = isAngular({projectDir}) ? "ts" : "js";
    const vendorAndroidPath = getFullPath(
        projectDir,
        `app/vendor-platform.android.${extension}`
    );

    editFileContent(vendorAndroidPath, addSnapshotToVendor);
}

function editFileContent(path, fn) {
    if (!fs.existsSync(path)) {
        return;
    }

    console.log('editing: ' + path)
    const config = fs.readFileSync(path, "utf8");
    const newConfig = fn(config);

    fs.writeFileSync(path, newConfig, "utf8");
}

function replaceStyleUrlResolvePlugin(config) {
    return config.replace(/StyleUrlResolvePlugin/g, "UrlResolvePlugin");
}

function addSnapshotPlugin(config) {

}

function addSnapshotToVendor(content) {
    if (content.indexOf("__snapshot") > -1) {
        return content;
    }


    return content.replace(FRAME_MATCH, SCOPED_FRAME);
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
    editExistingProjectFiles,
};
