const path = require("path");
const fs = require("fs");

const { isTypeScript, isAngular } = require("./projectHelpers");

const FRAME_MATCH = /(\s*)(require\("ui\/frame"\);)(\s*)(require\("ui\/frame\/activity"\);)/g;
const SCOPED_FRAME = `if (!global["__snapshot"]) {
    // In case snapshot generation is enabled these modules will get into the bundle
    // but will not be required/evaluated.
    // The snapshot webpack plugin will add them to the tns-java-classes.js bundle file.
    // This way, they will be evaluated on app start as early as possible.
$1    $2$3    $4
}`;

const CONFIG_MATCH = /(exports = [^]+?)\s*return ({[^]+target:\s*nativescriptTarget[^]+?};)/;
const CONFIG_REPLACE = `$1

    const config = $2

    if (env.snapshot) {
        plugins.push(new nsWebpack.NativeScriptSnapshotPlugin({
            chunk: "vendor",
            projectRoot: __dirname,
            webpackConfig: config,
            targetArchs: ["arm", "arm64", "ia32"],
            tnsJavaClassesOptions: { packages: ["tns-core-modules" ] },
            useLibs: false
        }));
    }

    return config;`;

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

function editExistingProjectFiles(projectDir) {
    const webpackConfigPath = getFullPath(projectDir, "webpack.config.js");
    const webpackCommonPath = getFullPath(projectDir, "webpack.common.js");

    const configChangeFunctions = [
        replaceStyleUrlResolvePlugin,
        addSnapshotPlugin,
    ];

    editFileContent(webpackConfigPath, ...configChangeFunctions);
    editFileContent(webpackCommonPath, ...configChangeFunctions);

    const extension = isAngular({projectDir}) ? "ts" : "js";
    const vendorAndroidPath = getFullPath(
        projectDir,
        `app/vendor-platform.android.${extension}`
    );

    editFileContent(vendorAndroidPath, addSnapshotToVendor);
}

function editFileContent(path, ...funcs) {
    if (!fs.existsSync(path)) {
        return;
    }

    let content = fs.readFileSync(path, "utf8");
    funcs.forEach(fn => content = fn(content));

    fs.writeFileSync(path, content, "utf8");
}

function replaceStyleUrlResolvePlugin(config) {
    if (config.indexOf("StyleUrlResolvePlugin") === -1) {
        return config;
    }

    console.info("Replacing deprecated StyleUrlsResolvePlugin with UrlResolvePlugin...");
    return config.replace(/StyleUrlResolvePlugin/g, "UrlResolvePlugin");
}

function addSnapshotPlugin(config) {
    if (config.indexOf("NativeScriptSnapshotPlugin") > -1) {
        return config;
    }

    console.info("Adding NativeScriptSnapshotPlugin configuration...");
    return config.replace(CONFIG_MATCH, CONFIG_REPLACE);
}

function addSnapshotToVendor(content) {
    if (content.indexOf("__snapshot") > -1) {
        return content;
    }

    console.info("Adding __snapshot configuration to app/vendor-platform.android ...");
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
    forceUpdateProjectFiles,
    editExistingProjectFiles,
};

