const { relative, resolve, join  } = require("path");

const webpack = require("webpack");
const nsWebpack = require("nativescript-dev-webpack");
const nativescriptTarget = require("nativescript-dev-webpack/nativescript-target");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const { NativeScriptWorkerPlugin } = require("nativescript-worker-loader/NativeScriptWorkerPlugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

module.exports = env => {
    const platform = env && (env.android && "android" || env.ios && "ios");
    if (!platform) {
        throw new Error("You need to provide a target platform!");
    }

    const platforms = ["ios", "android"];
    const projectRoot = __dirname;
    // Default destination inside platforms/<platform>/...
    const dist = resolve(projectRoot, nsWebpack.getAppPath(platform));
    const appResourcesPlatformDir = platform === "android" ? "Android" : "iOS";

    const {
        // The 'appPath' and 'appResourcesPath' values are fetched from
        // the nsconfig.json configuration file
        // when bundling with `tns run android|ios --bundle`.
        appPath = "app",
        appResourcesPath = "app/App_Resources",

        // Snapshot, uglify and report can be enabled by providing
        // the `--env.snapshot`, `--env.uglify` or `--env.report` flags
        // when running 'tns run android|ios'
        snapshot,
        uglify,
        report,
    } = env;

    const appFullPath = resolve(projectRoot, appPath);
    const appResourcesFullPath = resolve(projectRoot, appResourcesPath);

    const entryModule = nsWebpack.getEntryModule(appFullPath);
    const entryPath = `./${entryModule}`;
    const vendorPath = `./vendor`;

    const config = {
        mode: "development",
        context: appFullPath,
        watchOptions: {
            ignored: [
                appResourcesFullPath,
                // Don't watch hidden files
                "**/.*",
            ]
        },
        target: nativescriptTarget,
        entry: {
            bundle: entryPath,
            vendor: vendorPath,
        },
        output: {
            pathinfo: true,
            path: dist,
            libraryTarget: "commonjs2",
            filename: "[name].js",
            globalObject: "global",
        },
        resolve: {
            extensions: [".js", ".scss", ".css"],
            // Resolve {N} system modules from tns-core-modules
            modules: [
                "node_modules/tns-core-modules",
                "node_modules",
            ],
            alias: {
                '~': appFullPath
            },
            // don't resolve symlinks to symlinked modules
            symlinks: false
        },
        resolveLoader: {
            // don't resolve symlinks to symlinked loaders
            symlinks: false
        },
        node: {
            // Disable node shims that conflict with NativeScript
            "http": false,
            "timers": false,
            "setImmediate": false,
            "fs": "empty",
        },
        devtool: "none",
        optimization:  {
            runtimeChunk: { name: "runtime" },
            splitChunks: {
                automaticNameDelimiter: "-",
                chunks: "initial",
            }
        },
        module: {
            rules: [
                { test: /\.(html|xml)$/, use: "raw-loader" },

                {
                    test: /\.css$/,
                    use: { loader: "css-loader", options: { minimize: false, url: false } }
                },

                {
                    test: /\.scss$/,
                    use: [
                        { loader: "css-loader", options: { minimize: false, url: false } },
                        "sass-loader"
                    ]
                }
            ]
        },
        plugins: [
            // Define useful constants like TNS_WEBPACK
            new webpack.DefinePlugin({
                "global.TNS_WEBPACK": "true",
            }),
            // Remove all files from the out dir.
            new CleanWebpackPlugin([ `${dist}/**/*` ]),
           // Copy native app resources to out dir.
            new CopyWebpackPlugin([
              {
                from: `${appResourcesFullPath}/${appResourcesPlatformDir}`,
                to: `${dist}/App_Resources/${appResourcesPlatformDir}`,
                context: projectRoot
              },
            ]),
            // Copy assets to out dir. Add your own globs as needed.
            new CopyWebpackPlugin([
                { from: "fonts/**" },
                { from: "**/*.jpg" },
                { from: "**/*.png" },
                { from: "**/*.xml" },
            ], { ignore: [`${relative(appPath, appResourcesFullPath)}/**`] }),
            // Generate a bundle starter script and activate it in package.json
            new nsWebpack.GenerateBundleStarterPlugin([
                "./runtime", // install webpackJsonpCallback
                "./vendor", // require app/vendor.js
                "./bundle", // require the entry module (app/app.js)
            ]),
            // Support for web workers since v3.2
            new NativeScriptWorkerPlugin(),
            new nsWebpack.PlatformFSPlugin({
                platform,
                platforms,
            }),
            // Does IPC communication with the {N} CLI to notify events when running in watch mode.
            new nsWebpack.WatchStateLoggerPlugin(),
        ],
    };

    if (platform === "android") {
        // Add your custom Activities, Services and other android app components here.
        const appComponents = [
            "tns-core-modules/ui/frame",
            "tns-core-modules/ui/frame/activity",
        ];

        // Register all Android app components
        // in the entry module (bundle.js).
        config.module.rules.unshift({
            test: new RegExp(`${entryPath}.js|${vendorPath}.js`),
            use: {
                loader: "nativescript-dev-webpack/android-app-components-loader",
                options: { modules: appComponents }
            }
        });
    }

    if (report) {
        // Generate report files for bundles content
        config.plugins.push(new BundleAnalyzerPlugin({
            analyzerMode: "static",
            openAnalyzer: false,
            generateStatsFile: true,
            reportFilename: resolve(projectRoot, "report", `report.html`),
            statsFilename: resolve(projectRoot, "report", `stats.json`),
        }));
    }

    if (snapshot) {
        config.plugins.push(new nsWebpack.NativeScriptSnapshotPlugin({
            chunks: [
                "runtime",
                "vendors-bundle-vendor",
                "vendor",
            ],
            projectRoot,
            webpackConfig: config,
            targetArchs: ["arm", "arm64", "ia32"],
            useLibs: false
        }));
    }

    if (uglify) {
        config.plugins.push(new webpack.LoaderOptionsPlugin({ minimize: true }));

        // Work around an Android issue by setting compress = false
        const compress = platform !== "android";
        config.plugins.push(new UglifyJsPlugin({
            uglifyOptions: {
                compress,
            }
        }));
    }

    return config;
};
