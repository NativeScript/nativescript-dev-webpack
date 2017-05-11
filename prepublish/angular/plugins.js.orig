module.exports = `
        // Angular AOT compiler
        new AotPlugin({
            tsConfigPath: "tsconfig.aot.json",
            entryModule: resolve(__dirname, "app/app.module#AppModule"),
            typeChecking: false
        }),

        // Resolve .ios.css and .android.css component stylesheets
        new nsWebpack.StyleUrlResolvePlugin({platform}),
`;
