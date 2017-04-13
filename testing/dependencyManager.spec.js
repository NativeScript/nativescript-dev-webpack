const path = require("path");
const fs = require("fs");

const dependencyManager = require("../dependencyManager");
const readJsonFile = jsonPath => {
    const fullPath = path.resolve(__dirname, jsonPath);
    return require(fullPath);
};

let packageJson = readJsonFile("./package-configs/ns2ng4.json");
dependencyManager.addProjectDeps(packageJson);
console.log(packageJson);

