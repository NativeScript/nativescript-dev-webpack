module.exports = function (loadModuleFn) {
    const application = require("@nativescript/core/application");
    require("@nativescript/core/ui/styling/style-scope");

    loadModuleFn();

    application.loadAppCss();
}
