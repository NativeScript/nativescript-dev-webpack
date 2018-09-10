module.exports.reload = `
    if (module.hot) {
        module.hot.accept();
        module.hot.dispose(() => {
            setTimeout(() => {
                global.__hmrLivesyncBackup();
            });
        })
    }
`;

