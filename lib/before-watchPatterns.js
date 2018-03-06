const { basename } = require("path");
const { buildEnvData, getCompilationContext } = require("./utils");

module.exports = function (hookArgs) {
    const { liveSyncData } = hookArgs;
    if (!liveSyncData || !liveSyncData.bundle) {
        return;
    }

    const { platforms } = hookArgs;
    const { env } = liveSyncData;
    return (args, originalMethod) => {
        return originalMethod(...args).then(originalPatterns => {
            if (!platforms.length) {
                throw new Error("Target platform should be specified!");
            }

            const compilationContexts = platforms.map(platform =>
                getContext(platform, env));

            const ignorePatterns = compilationContexts.map(
                context => `!${context}`
            );

            return [...originalPatterns, ...ignorePatterns];
        });
    };
}

function getContext(platform, env) {
    const fullEnvData = buildEnvData(platform, env);
    return getCompilationContext(fullEnvData);
}
