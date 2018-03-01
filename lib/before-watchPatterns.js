const { AppDirectoryLocation } = require("./constants");

module.exports = function (hookArgs) {
	if (hookArgs.liveSyncData && hookArgs.liveSyncData.bundle) {
		return (args, originalMethod) => {
			return originalMethod(...args).then(originalPatterns => {
				const appDirectoryLocationIndex = originalPatterns.indexOf(AppDirectoryLocation);
				if (appDirectoryLocationIndex !== -1) {
					originalPatterns.splice(appDirectoryLocationIndex, 1);
				}

				return originalPatterns;
			});
		};
	}
}
