module.exports = function (source) {
    this.cacheable();
    const { angular = false, loadCss = true, registerModules = /(root|page)\.(xml|css|js|ts|scss)$/ } = this.query;

    source = `
        require("tns-core-modules/bundle-entry-points");
        ${source}
    `;

    if (!angular && registerModules) {
        source = `
            const context = require.context("~/", true, ${registerModules});
            global.registerWebpackModules(context);
            ${source}
        `;
    }

    if (loadCss) {
        source = `
            require("${
                angular ?
                    'nativescript-dev-webpack/load-application-css-angular' :
                    'nativescript-dev-webpack/load-application-css-regular'
            }")();
            ${source}
        `;
    }

    this.callback(null, source);
};

