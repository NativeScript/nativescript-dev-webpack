const utils = require("./utils");
const { spawn } = require("child_process");
const { join } = require("path");
let hasBeenInvoked = false;

function escapeWithQuotes(arg) {
	return `"${arg}"`;
}

function spawnChildProcess(projectDir, command, ...args) {
	return new Promise((resolve, reject) => {
		const escapedArgs = args.map(escapeWithQuotes)

		const childProcess = spawn(command, escapedArgs, {
			stdio: "inherit",
			pwd: projectDir,
			shell: true,
		});

		childProcess.on("close", code => {
			if (code === 0) {
				resolve();
			} else {
				reject({
					code,
					message: `child process exited with code ${code}`,
				});
			}
		});
	});
}

function throwError(error) {
	console.error(error.message);
	process.exit(error.code || 1);
}

function prepareJSWebpack(config, $mobileHelper, $projectData, originalArgs, originalMethod) {
	if (config.bundle) {
		return new Promise(function (resolve, reject) {
			console.log(`Running webpack for ${config.platform}...`);
			const envFlagNames = Object.keys(config.env).concat([config.platform.toLowerCase()]);

			const snapshotEnvIndex = envFlagNames.indexOf("snapshot");
			if (snapshotEnvIndex !== -1 && !utils.shouldSnapshot($mobileHelper, config.platform, config.bundle)) {
				envFlagNames.splice(snapshotEnvIndex, 1);
			}

			const args = [
				$projectData.projectDir,
				"node",
				"--preserve-symlinks",
				join($projectData.projectDir, "node_modules", "webpack", "bin", "webpack.js"),
				"--config=webpack.config.js",
				"--progress",
				...envFlagNames.map(item => `--env.${item}`)
			].filter(a => !!a);

			// TODO: require webpack instead of spawning
			spawnChildProcess(...args)
				.then(resolve)
				.catch(throwError);
		});
	}
}

module.exports = function ($mobileHelper, $projectData, hookArgs) {
	const env = hookArgs.config.env || {};
	const platform = hookArgs.config.platform;
	const appFilesUpdaterOptions = hookArgs.config.appFilesUpdaterOptions;
	const config = {
		env,
		platform,
		bundle: appFilesUpdaterOptions.bundle
	};

	return config.bundle && prepareJSWebpack.bind(prepareJSWebpack, config, $mobileHelper, $projectData);
}
