const { basename } = require("path");
const { getAppPathFromProjectData } = require("../projectHelpers");

module.exports = function (hookArgs) {
    const { liveSyncData } = hookArgs;
    if (!liveSyncData || !liveSyncData.bundle) {
        return;
    }

    return (args, originalMethod) => {
        return originalMethod(...args).then(originalPatterns => {

            const appPath = getAppPathFromProjectData(hookArgs.projectData);
            const ignorePattern = `!${appPath}`;

            return [...originalPatterns, ignorePattern];
        });
    };
}
