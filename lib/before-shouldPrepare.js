const { join } = require("path");
const { readFileSync, existsSync, writeFileSync } = require("fs");
const envOptionsCacheFileLocation = join(__dirname, "env.cache.json");

module.exports = function (hookArgs) {
	const platformInfo = hookArgs.shouldPrepareInfo && hookArgs.shouldPrepareInfo.platformInfo;
	if (platformInfo && platformInfo.appFilesUpdaterOptions && platformInfo.appFilesUpdaterOptions.bundle) {

		return (args, originalMethod) => {
			return originalMethod(...args).then(originalShouldPrepare => {
				const currentEnvString = JSON.stringify(platformInfo.env || {});
				if (existsSync(envOptionsCacheFileLocation)) {
					const oldEnvOptionsString = readFileSync(envOptionsCacheFileLocation).toString();
					if (oldEnvOptionsString === currentEnvString) {
						return originalShouldPrepare;
					}
				}

				writeFileSync(envOptionsCacheFileLocation, currentEnvString);

				return true;
			});
		};
	}
}
