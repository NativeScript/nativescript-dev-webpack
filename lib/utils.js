const os = require("os");

function shouldSnapshot($mobileHelper, platform, bundle) {
	const platformSupportsSnapshot = $mobileHelper.isAndroidPlatform(platform);
	const osSupportsSnapshot = os.type() !== "Windows_NT";
	return bundle && platformSupportsSnapshot && osSupportsSnapshot;
}

module.exports.shouldSnapshot = shouldSnapshot;
