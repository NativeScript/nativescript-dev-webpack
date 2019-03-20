const { join, relative } = require("path");

module.exports = function ({ appFullPath, projectRoot, angular, rootPagesRegExp }) {
    // TODO: Consider to use the files property from karma.conf.js
    const testFilesRegExp = /tests\/.*\.js/;
    const runnerFullPath = join(projectRoot, "node_modules", "nativescript-unit-test-runner");
    const runnerRelativePath = relative(appFullPath, runnerFullPath);
    let source = `
        require("tns-core-modules/bundle-entry-points");
        const runnerContext = require.context("${runnerRelativePath}", true, ${rootPagesRegExp});
        global.registerWebpackModules(runnerContext);
    `;

    if (angular) {
        source += `
            const context = require.context("~/", true, ${testFilesRegExp});
            global.registerWebpackModules(context);
        `;
    } else {
        const registerModules = new RegExp(`(${rootPagesRegExp.source})|(${testFilesRegExp.source})`);
        source += `
            const context = require.context("~/", true, ${registerModules});
            global.registerWebpackModules(context);
        `;
    }

    const runnerEntryPointPath = join(runnerRelativePath, "bundle-app.js");
    source += `
        require("${runnerEntryPointPath}");
    `;

    return source;
}