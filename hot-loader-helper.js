module.exports.reload = function(type) { return `
    if (module.hot) {
        module.hot.accept();
        module.hot.dispose(() => {
            setTimeout(() => {
                global.__hmrLivesyncBackup();
            }, ${type === 'style' ? "global.__hmrInitialSync ? 1000 : 0" : 0});
        })
    }
`};
// we need to add a timeout of 1000 if we have a css change, otherwise the app crashes on initial hmr sync