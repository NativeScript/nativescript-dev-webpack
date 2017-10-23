// Snapshot the ~/app.css and the theme
const application = require("application");
require("ui/styling/style-scope");
global.registerModule("app.css", () => require("~/app.css"));
application.loadAppCss();

require("./vendor-platform");

require("bundle-entry-points");
