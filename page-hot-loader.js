module.exports = function (source) {
    const hmr = `
        if (module.hot) {
            module.hot.accept();
            module.hot.dispose(() => {
                setTimeout(() => {
                    global.__hmrLivesyncBackup();
                });
            })
        }
    `;

    return `${source};${hmr}`
};
