const { basename } = require("path");
const {
    buildEnvData,
    getCompilationContext,
    setProcessInitDirectory,
} = require("./utils");

module.exports = function ($projectData, hookArgs) {
    const { liveSyncData } = hookArgs;
    if (!liveSyncData || !liveSyncData.bundle) {
        return;
    }

    setProcessInitDirectory($projectData.projectDir);
    const { platforms } = hookArgs;
    const { env } = liveSyncData;
    return (args, originalMethod) => {
        return originalMethod(...args).then(originalPatterns => {
            if (!platforms || !platforms.length) {
                throw new Error("Target platform should be specified!");
            }

            const compilationContexts = platforms.map(platform =>
                getContext($projectData, platform, env));

            const ignorePatterns = compilationContexts.map(
                context => `!${context}`
            );

            return [...originalPatterns, ...ignorePatterns];
        });
    };
}

function getContext($projectData, platform, env) {
    const fullEnvData = buildEnvData($projectData, platform, env);
    return getCompilationContext($projectData.projectDir, fullEnvData);
}
