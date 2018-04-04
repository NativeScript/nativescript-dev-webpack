"use strict";

const { dirname } = require("path");
const hook = require("nativescript-hook")(__dirname);

const { compareProjectFiles } = require("./projectFilesManager");
const { getProjectDir } = require("./projectHelpers");

const projectDir = getProjectDir();

if (projectDir) {
    compareProjectFiles(projectDir);

    hook.postinstall();
    const installer = require("./installer");
    installer.install();
} else {
    // We are installing dev dependencies for the nativescript-dev-webpack plugin.
    console.log("Skipping postinstall artifacts! We assumed the nativescript-dev-webpack is installing devDependencies");
}
