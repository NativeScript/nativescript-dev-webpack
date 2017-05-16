module.exports = `
        {
            test: /\\.html$|\\.xml$/,
            use: [
                "raw-loader",
            ]
        },
        // Root stylesheet gets extracted with bundled dependencies
        {
            test: new RegExp(mainSheet),
            use: ExtractTextPlugin.extract([
                {
                    loader: "resolve-url-loader",
                    options: { silent: true },
                },
                {
                    loader: "nativescript-css-loader",
                    options: { minimize: false }
                },
                "nativescript-dev-webpack/platform-css-loader",
            ]),
        },
        // Other CSS files get bundled using the raw loader
        {
            test: /\\.css$/,
            exclude: new RegExp(mainSheet),
            use: [
                "raw-loader",
            ]
        },
        // SASS support
        {
            test: /\\.scss$/,
            use: [
                "raw-loader",
                "resolve-url-loader",
                "sass-loader",
            ]
        },
`;
