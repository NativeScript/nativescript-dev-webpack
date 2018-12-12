module.exports = function (source) {
    this.cacheable();
    const { angular = false, loadCss = true, registerModules = /(root|page)\.(xml|css|js|ts|scss)$/ } = this.query;

    source = `
        require("tns-core-modules/bundle-entry-points");
        ${source}
    `;

    if (!angular && registerModules) {
        const hmr = `
            if (module.hot) {
                const fileSystemModule = require("tns-core-modules/file-system");
                const applicationFiles = fileSystemModule.knownFolders.currentApp();

                global.__hmrLivesyncBackup = global.__onLiveSync;
                global.__onLiveSync = function () {
                    console.log("HMR: Sync...");
                    require("nativescript-dev-webpack/hot")(__webpack_require__.h(), (fileName) => applicationFiles.getFile(fileName));
                };

                global.__hmrRefresh = function({ type, module }) {
                    global.__hmrNeedReload = true;
                    setTimeout(() => {
                        if(global.__hmrNeedReload) {
                            global.__hmrNeedReload = false;
                            global.__hmrLivesyncBackup({ type, module });
                        }
                    });
                }

                global.__hmrInitialSync = true; // needed to determine if we are performing initial sync
                global.__onLiveSync();
            }
        `;

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

