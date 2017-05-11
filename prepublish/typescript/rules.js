module.exports = `
        // Compile TypeScript files, replace templateUrl and styleUrls.
        {
            test: /\\.ts$/,
            loaders: [
                "awesome-typescript-loader",
            ]
        }
`;
