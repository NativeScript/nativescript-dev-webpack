const { convertSlashesInPath } = require("./projectHelpers");

module.exports = function (source) {
    this.cacheable();
    const { modules } = this.query;
    const imports = modules.map(convertSlashesInPath)
        .map(m => `require("${m}");`).join("\n");
    const augmentedSource = `
        let application = __webpack_require__("tns-core-modules/application");
        if (application.android && !global["__snapshot"]) {
            ${imports}
        }

        ${source}
    `;

    this.callback(null, augmentedSource);
};
