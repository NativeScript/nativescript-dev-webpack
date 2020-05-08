const webpackConfig = require("./webpack.config");
const path = require("path");

module.exports = env => {
	env = env || {};
	env.appComponents = env.appComponents || [];
	env.appComponents.push(path.resolve(__dirname, "app/activity.android.js"));

	env.entries = env.entries || {};
	env.entries.application = "./application.android";
	const config = webpackConfig(env);
	return config;
};