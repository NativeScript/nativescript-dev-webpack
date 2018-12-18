const { safeGet } = require("./projectHelpers");

const LAZY_RESOURCE_CONTEXT = "$$_lazy_route_resource";
const HOT_SELF_ACCEPT = "module.hot && module.hot.accept()";

const isLazyLoadedNgModule = resource => {
    const issuer = safeGet(resource, "issuer");
    const issuerContext = safeGet(issuer, "context");

    return issuerContext && issuerContext.endsWith(LAZY_RESOURCE_CONTEXT);
};

module.exports = function (source) {
    return isLazyLoadedNgModule(this._module) ?
        `${source};${HOT_SELF_ACCEPT}`:
        source;
};
