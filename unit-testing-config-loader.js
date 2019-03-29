const { join, relative } = require("path");

module.exports = function ({ appFullPath, projectRoot, angular, rootPagesRegExp }) {
    const testFilesRegExp = getKarmaConfig().files;
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

function getKarmaConfig() {
    let result = { files: /tests\/.*\.(js|ts)/ };
    const pathToKarmaConfig = join(__dirname, "../../karma.conf.js");
    if (existsSync(pathToKarmaConfig)) {
        try {
            require(pathToKarmaConfig)({ set: (options) => result = options });
        } catch (err) { }
    }

    return result;
}