const { reload } = require("./hot-loader-helper");
const { fromRelativePathToUnix } = require("./lib/utils");

module.exports = function (source) {
    const typeMarkup = "markup";
    const moduleRelativePath = this.resourcePath.replace(this.rootContext, ".");
    const modulePath = fromRelativePathToUnix(moduleRelativePath);
    return `${source};${reload({ type: typeMarkup, path: modulePath })}`;
};
