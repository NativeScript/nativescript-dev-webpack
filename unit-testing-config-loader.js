const { join, relative } = require("path");
const { convertSlashesInPath } = require("./projectHelpers");

module.exports = function ({ appFullPath, projectRoot, angular, rootPagesRegExp }) {
    // TODO: Consider to use the files property from karma.conf.js
    const testFilesRegExp = /tests\/.*\.(ts|js)/;
    const runnerFullPath = join(projectRoot, "node_modules", "nativescript-unit-test-runner");
    const runnerRelativePath = convertSlashesInPath(relative(appFullPath, runnerFullPath));
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

    const runnerEntryPointPath = convertSlashesInPath(join(runnerRelativePath, "bundle-app.js"));
    source += `
        require("${runnerEntryPointPath}");
    `;

    return source;
}