const { safeGet } = require("./projectHelpers");

const LAZY_RESOURCE_CONTEXT = "$$_lazy_route_resource";
const HOT_SELF_ACCEPT = `
    if (module.hot) {
        module.hot.accept();
        module.hot.dispose(() => global.__hmrRefresh({}));
    }
    `;

const isLazyLoadedNgModule = resource => {
    const issuer = safeGet(resource, "issuer");
    const issuerContext = safeGet(issuer, "context");

    return issuerContext && issuerContext.endsWith(LAZY_RESOURCE_CONTEXT);
};

module.exports = function (source) {
    return isLazyLoadedNgModule(this._module) ?
        `${source};${HOT_SELF_ACCEPT}` :
        source;
};
