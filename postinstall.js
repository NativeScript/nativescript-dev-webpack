var hook = require('nativescript-hook')(__dirname);
hook.postinstall();

var path = require("path");
var fs = require("fs");

var projectDir = hook.findProjectDir();
var appDir = path.join(projectDir, "app");

// Create a webpack.config.js file, if not present.
var configTemplatePath = path.join(__dirname, "webpack.config.js.template");
var configPath = path.join(projectDir, "webpack.config.js");
if (!fs.existsSync(configPath)) {
    var configContent = fs.readFileSync(configTemplatePath, "utf8");
    fs.writeFileSync(configPath, configContent);
}

var javaClassesSrc = path.join(__dirname, "tns-java-classes.js");
var javaClassesDest = path.join(appDir, "tns-java-classes.js");
if (!fs.existsSync(javaClassesDest)) {
    var javaClassesContent = fs.readFileSync(javaClassesSrc, "utf8");
    fs.writeFileSync(javaClassesDest, javaClassesContent);
}
