module.exports = function(isAngular) {
    const application = require("tns-core-modules/application");
    require("tns-core-modules/ui/styling/style-scope");

    if (isAngular) {
        global.registerModule("./app.css", () => require("~/app"));
    } else {
        const appCssContext = require.context("~/", false, /^\.\/app\.(css|scss|less|sass)$/);
        global.registerWebpackModules(appCssContext);
    }

    application.loadAppCss();
}

