module.exports = function(source) {
    this.cacheable();
    const { modules } = this.query;
    const imports = modules.map(m => `require("${m}");`).join("\n");
    const augmentedSource = `${imports}\n${source}`;

    this.callback(null, augmentedSource);
};
