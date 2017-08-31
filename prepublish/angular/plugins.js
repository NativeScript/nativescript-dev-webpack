module.exports = `
        // Angular AOT compiler
        new AotPlugin(
            Object.assign({
                entryModule: resolve(__dirname, "app/app.module#AppModule"),
                typeChecking: false
            }, ngToolsWebpackOptions)
        ),

        // Resolve .ios.css and .android.css component stylesheets, and .ios.html and .android component views
        new nsWebpack.UrlResolvePlugin({
            platform: platform,
            resolveStylesUrls: true,
            resolveTemplateUrl: true
        }),
`;
