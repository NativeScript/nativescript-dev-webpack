module.exports.reload = function(type) { return `
    if (module.hot) {
        module.hot.accept();
        module.hot.dispose(() => {
            global.__hmrNeedReload = true;
            setTimeout(() => {
                if(global.__hmrNeedReload) {
                    global.__hmrNeedReload = false;
                    global.__hmrLivesyncBackup();
                }
            }, ${type === 'style' ? "global.__hmrInitialSync ? 1000 : 0" : 0});
        })
    }
`};
// we need to add a timeout of 1000 if we have a css change, otherwise the app crashes on initial hmr sync
