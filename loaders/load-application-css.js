module.exports = function (loadModuleFn) {
    const application = require("tns-core-modules/application");
    require("tns-core-modules/ui/styling/style-scope");

    loadModuleFn();

    application.loadAppCss();
}
