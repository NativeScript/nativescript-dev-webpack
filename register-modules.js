require("tns-core-modules/bundle-entry-points");
const context = require.context("~/", true, /(root|page|fragment)\.(xml|css|js|ts|scss)$/);
global.registerWebpackModules(context);

