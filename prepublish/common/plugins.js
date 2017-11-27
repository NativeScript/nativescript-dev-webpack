module.exports = `
        new ExtractTextPlugin(mainSheet),

        // Vendor libs go to the vendor.js chunk
        new webpack.optimize.CommonsChunkPlugin({
            name: ["vendor"],
        }),

        // Define useful constants like TNS_WEBPACK
        new webpack.DefinePlugin({
            "global.TNS_WEBPACK": "true",
        }),

        // Copy assets to out dir. Add your own globs as needed.
        new CopyWebpackPlugin([
            { from: mainSheet },
            { from: "css/**" },
            { from: "fonts/**" },
            { from: "**/*.jpg" },
            { from: "**/*.png" },
            { from: "**/*.xml" },
        ]),

        // Generate a bundle starter script and activate it in package.json
        new nsWebpack.GenerateBundleStarterPlugin([
            "./vendor",
            "./bundle",
        ]),

        // Support for web workers since v3.2
        new NativeScriptWorkerPlugin(),

        // Generate report files for bundles content
        new BundleAnalyzerPlugin({
            analyzerMode: "static",
            openAnalyzer: false,
            generateStatsFile: true,
            reportFilename: join(__dirname, "report", \`report.html\`),
            statsFilename: join(__dirname, "report", \`stats.json\`),
        }),`;
