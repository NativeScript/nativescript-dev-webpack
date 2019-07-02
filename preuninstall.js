"use strict";

const hook = require("nativescript-hook")(__dirname);

const { getProjectDir } = require("./projectHelpers");

const projectDir = getProjectDir();

if (projectDir) {
    hook.preuninstall();
}
