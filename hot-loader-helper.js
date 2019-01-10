module.exports.reload = function ({ type, module }) {
    return `
    if (module.hot) {
        module.hot.accept();
        module.hot.dispose(() => {
            global.hmrRefresh({ type: '${type}', module: '${module}' });
        })
    }
`};
