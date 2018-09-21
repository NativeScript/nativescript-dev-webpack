module.exports.reload = function(type) { return `
    if (module.hot) {
        module.hot.accept();
        module.hot.dispose(() => {
            global.__hmrRefresh('${type}');
        })
    }
`};

