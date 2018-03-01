const os = require("os");

function shouldSnapshot($mobileHelper, config) {
	const platformSupportsSnapshot = $mobileHelper.isAndroidPlatform(config.platform);
	const osSupportsSnapshot = os.type() !== "Windows_NT";
	return config.bundle && config.release && platformSupportsSnapshot && osSupportsSnapshot;
}

module.exports.shouldSnapshot = shouldSnapshot;
