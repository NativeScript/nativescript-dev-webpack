require("tns-core-modules/bundle-entry-points");
const context = require.context("~/", true, /(root|page)\.(xml|css|js|ts|scss)$/);
global.registerWebpackModules(context);

