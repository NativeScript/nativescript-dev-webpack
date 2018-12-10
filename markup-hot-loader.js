const { reload } = require("./hot-loader-helper");

module.exports = function (source) {
    const typeMarkup = "markup";
    const modulePath = this.resourcePath.replace(this.context, ".");
    return `${source};${reload({ type: typeMarkup, module: modulePath })}`;
};
