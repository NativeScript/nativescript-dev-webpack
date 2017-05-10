module.exports = `
const mainSheet = \`app.css\`;

module.exports = env => {
    const platform = getPlatform(env);

    // Default destination inside platforms/<platform>/...
    const path = resolve(nsWebpack.getAppPath(platform));

    const entry = {
        // Discover entry module from package.json
        bundle: \`./\${nsWebpack.getEntryModule()}\`,

        // Vendor entry with third-party libraries
        vendor: \`./vendor\`,

        // Entry for stylesheet with global application styles
        [mainSheet]: \`./\${mainSheet}\`,
    };

    const rules = getRules();
    const plugins = getPlugins(platform, env);
    const extensions = getExtensions(platform);

    return {
        context: resolve("./app"),
        target: nativescriptTarget,
        entry,
        output: {
            pathinfo: true,
            path,
            libraryTarget: "commonjs2",
            filename: "[name].js",
        },
        resolve: {
            extensions,

            // Resolve {N} system modules from tns-core-modules
            modules: [
                "node_modules/tns-core-modules",
                "node_modules",
            ]
        },
        node: {
            // Disable node shims that conflict with NativeScript
            "http": false,
            "timers": false,
            "setImmediate": false,
            "fs": "empty",
        },
        module: { rules },
        plugins,
    };
};
`;

