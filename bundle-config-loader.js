module.exports = function (source) {
    this.cacheable();
    const { angular = false, loadCss = true, registerModules = /(root|page)\.(xml|css|js|ts|scss)$/ } = this.query;

    const hmr = `
        if (module.hot) {
            const hmrUpdate = require("nativescript-dev-webpack/hmr").hmrUpdate;

            global.__hmrSync = global.__onLiveSync;

            global.__onLiveSync = function () {
                hmrUpdate();
            };

            global.__hmrRefresh = function({ type, module }) {
                setTimeout(() => {
                    global.__hmrSync({ type, module });
                });
            };

            global.__onLiveSync();
        }
        `;

    source = `
        require("tns-core-modules/bundle-entry-points");
        ${source}
    `;

    if (angular) {
        source = `
            ${hmr}
            ${source}
        `;
    } else if (registerModules) {
        source = `
            ${hmr}
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
