var fs = require("fs");
var path = require("path");
var makeConfig = require("./webpack.common");

var packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, "package.json"), "utf8"));
var appName = packageJson.nativescript.id.replace(/.*\.([^.]+)$/, "$1");

module.exports = makeConfig("ios", "platforms/ios/" + appName + "/app");
