"use strict";

const { dirname } = require("path");
const hook = require("nativescript-hook")(__dirname);

if (hook.findProjectDir() === __dirname) {
    // We are installing dev dependencies for the nativescript-dev-webpack plugin.
    console.log("Skipping postinstall artifacts! We assumed the nativescript-dev-webpack is installing devDependencies");
} else {
    hook.postinstall();
    const installer = require("./installer");
    installer.install();
}
