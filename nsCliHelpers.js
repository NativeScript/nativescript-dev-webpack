const { getPath } = require("global-modules-path");

const PROJECT_DATA_GETTERS = {
    appPath: "getAppDirectoryRelativePath",
    appResourcesPath: "getAppResourcesRelativeDirectoryPath",
};

function getProjectData(projectDir) {
    const cli = getNsCli();
    if (!cli) {
      return {};
    }

    const projectDataService = cli.projectDataService;
    const projectData = safeGet(projectDataService, "getProjectData", projectDir);

    return projectData;
}

function getNsCli() {
    const cliPath = getPath("nativescript", "tns");
    if (!cliPath) {
        return;
    }

    const cli = require(cliPath);

    return cli;
}

function safeGet(object, property, ...args) {
    if (!object) {
        return;
    }

    const value = object[property];
    if (!value) {
        return;
    }

    return typeof value === "function" ?
        value.bind(object)(...args) :
        value;
}

module.exports = {
    PROJECT_DATA_GETTERS,
    getProjectData,
    safeGet,
};
