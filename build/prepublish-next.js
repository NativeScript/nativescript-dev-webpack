#!/usr/bin/env node

const { dirname: pathDirname } = require("path");
const { getPackageJson, writePackageJson } = require("../projectHelpers");

const tag = "next";
const projectDir = pathDirname(__dirname);
const packageJson = getPackageJson(projectDir);
const [, , packageVersion = new Date() ] = process.argv;

packageJson.publishConfig = Object.assign(
    packageJson.publishConfig || {},
    { tag }
);

delete packageJson.private;

const currentVersion = packageJson.version;
const nextVersion = `${currentVersion}-${packageVersion}`;
const newPackageJson = Object.assign(packageJson, { version: nextVersion });

writePackageJson(newPackageJson, projectDir);
