var hook = require('nativescript-hook')(__dirname);
hook.postinstall();

var path = require("path");
var fs = require("fs");

var projectDir = hook.findProjectDir();

// Register webpack script in package.json.
var packageJsonPath = path.join(projectDir, "package.json");
var packageJsonContent = fs.readFileSync(packageJsonPath, "utf8");
var jsonContent = JSON.parse(packageJsonContent);

var scripts = jsonContent.scripts || {};
if (!scripts.webpack) {
    scripts.webpack = "webpack";
}
jsonContent.scripts = scripts;

var modifiedPackageJson = JSON.stringify(jsonContent, null, 4);
var packageJsonContent = fs.writeFileSync(packageJsonPath, modifiedPackageJson);

// Create a webpack.config.js file, if not present.
var configTemplatePath = path.join(__dirname, "webpack.config.js.template");
var configPath = path.join(projectDir, "webpack.config.js");
if (!fs.existsSync(configPath)) {
    var configContent = fs.readFileSync(configTemplatePath, "utf8");
    fs.writeFileSync(configPath, configContent);
}
