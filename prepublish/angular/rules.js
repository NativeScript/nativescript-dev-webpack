module.exports = `
        // Compile TypeScript files with ahead-of-time compiler.
        {
            test: /\.ts$/,
            use: [
                { loader: "nativescript-dev-webpack/tns-aot-loader" },
                {
                    loader: "@ngtools/webpack",
                    options: ngToolsWebpackOptions,
                },
            ]
        },
`;
