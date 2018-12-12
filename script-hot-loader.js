const { reload } = require("./hot-loader-helper");

module.exports = function (source) {
    const typeScript = "script";
    const modulePath = this.resourcePath.replace(this.context, ".");
    return `${source};${reload({ type: typeScript, module: modulePath })}`;
};
