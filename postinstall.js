"use strict";

const { dirname } = require("path");
const hook = require("nativescript-hook")(__dirname);

const { getProjectDir } = require("./projectHelpers");

if (getProjectDir()) {
    hook.postinstall();
    const installer = require("./installer");
    installer.install();
} else {
    // We are installing dev dependencies for the nativescript-dev-webpack plugin.
    console.log("Skipping postinstall artifacts! We assumed the nativescript-dev-webpack is installing devDependencies");
}
