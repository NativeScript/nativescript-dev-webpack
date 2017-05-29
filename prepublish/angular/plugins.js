module.exports = `
        // Angular AOT compiler
        new AotPlugin({
            tsConfigPath: "tsconfig.aot.json",
            entryModule: resolve(__dirname, "app/app.module#AppModule"),
            typeChecking: false
        }),

        // Resolve .ios.css and .android.css component stylesheets, and .ios.html and .android component views
        new nsWebpack.UrlResolvePlugin({
            platform: platform,
            resolveStylesUrls: true,
            resolveTemplateUrl: true
        }),
`;
