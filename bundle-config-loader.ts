import * as unitTestingConfigLoader from "./unit-testing-config-loader";
import { loader } from "webpack";
import { getOptions } from "loader-utils";
import * as escapeRegExp from "escape-string-regexp";

// Matches all source, markup and style files that are not in App_Resources
const defaultMatch = "(?<!App_Resources.*)\\.(xml|css|js|(?<!\\.d\\.)ts|(?<!_[\\w-]*\\.)scss)$";

const loader: loader.Loader = function (source, map) {
    let {
        angular = false,
        loadCss = true,
        unitTesting,
        projectRoot,
        appFullPath,
        registerModules,
        ignoredFiles = []
    } = getOptions(this);

    if (!registerModules) {
        registerModules = defaultMatch;
        for (const key in ignoredFiles) {
            registerModules = `(?<!${escapeRegExp(ignoredFiles[key])})` + registerModules;
        }
        registerModules = new RegExp(registerModules);
    }

    if (unitTesting) {
        source = unitTestingConfigLoader({ appFullPath, projectRoot, angular, rootPagesRegExp: registerModules });
        this.callback(null, source);
        return;
    }

    const hmr = `
        if (module.hot) {
            const hmrUpdate = require("nativescript-dev-webpack/hmr").hmrUpdate;
            global.__initialHmrUpdate = true;
            global.__hmrSyncBackup = global.__onLiveSync;

            global.__onLiveSync = function () {
                hmrUpdate();
            };

            global.hmrRefresh = function({ type, path } = {}) {
                if (global.__initialHmrUpdate) {
                    return;
                }

                setTimeout(() => {
                    global.__hmrSyncBackup({ type, path });
                });
            };

            hmrUpdate().then(() => {
                global.__initialHmrUpdate = false;
            })
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
            if (module.hot) {
                module.hot.accept(context.id, () => { 
                    console.log("HMR: Accept module '" + context.id + "' from '" + module.id + "'"); 
                });
            }
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

    this.callback(null, source, map);
};


export default loader;