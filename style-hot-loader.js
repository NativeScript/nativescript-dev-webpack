const { reload } = require("./hot-loader-helper");

module.exports = function (source) {
    const typeStyle = "style";
    const modulePath = this.resourcePath.replace(this.rootContext, ".");
    return `${source};${reload({ type: typeStyle, path: modulePath })}`;
};
