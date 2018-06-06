const application = require("tns-core-modules/application");
require("tns-core-modules/ui/styling/style-scope");

global.registerModule("./app.css", () => require("~/app"));
const appCssContext = require.context("~/", false, /^\.\/app\.(css|scss|less|sass)$/);
global.registerWebpackModules(appCssContext);

application.loadAppCss();

