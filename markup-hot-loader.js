const { reload } = require("./hot-loader-helper");

module.exports = function (source) {
    const typeMarkup = "markup";
    const modulePath = this.resourcePath.replace(this.rootContext, ".");
    return `${source};${reload({ type: typeMarkup, path: modulePath })}`;
};
