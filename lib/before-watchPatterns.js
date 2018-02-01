module.exports = function (hookArgs) {
	if (hookArgs.liveSyncData && hookArgs.liveSyncData.bundle) {
		const appDirectoryLocation = "app"; // Might need to get this from config file in the future
		const appResourcesDirectoryLocation = "app/App_Resources"; // Might need to get this from config file in the future
		return (args, originalMethod) => {
			return originalMethod().then(originalPatterns => {
				const appDirectoryLocationIndex = originalPatterns.indexOf(appDirectoryLocation);
				if (appDirectoryLocationIndex !== -1) {
					originalPatterns.splice(appDirectoryLocationIndex, 1);
				}

				if (originalPatterns.indexOf(appResourcesDirectoryLocation) === -1) {
					originalPatterns.push(appResourcesDirectoryLocation);
				}

				return originalPatterns;
			});
		};
	}
}
