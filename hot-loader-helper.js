module.exports.reload = function ({ type, module }) {
    return `
    if (module.hot) {
        module.hot.accept();
        module.hot.dispose(() => {
            global.__hmrRefresh({ type: '${type}', module: '${module}' });
        })
    }
`};
