var hook = require('nativescript-hook')(__dirname);
hook.postinstall();

var path = require("path");
var fs = require("fs");

var projectDir = hook.findProjectDir();

// Create a webpack.config.js file, if not present.
var configTemplatePath = path.join(__dirname, "webpack.config.js.template");
var configPath = path.join(projectDir, "webpack.config.js");
if (!fs.existsSync(configPath)) {
    var configContent = fs.readFileSync(configTemplatePath, "utf8");
    fs.writeFileSync(configPath, configContent);
}
