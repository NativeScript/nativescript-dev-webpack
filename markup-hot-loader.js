const { reload } = require("./hot-loader-helper");

module.exports = function (source) {
    return `${source};${reload('markup')}`;
};
