module.exports = function(source) {
    this.cacheable();
    const { registerPages, loadCss } = this.query;

    if (registerPages) {
        source = `
            require("nativescript-dev-webpack/register-modules");
            ${source}
        `;
    }

    if (loadCss) {
        source = `
            require("nativescript-dev-webpack/load-application-css");
            ${source}
        `;
    }

    this.callback(null, source);
};

