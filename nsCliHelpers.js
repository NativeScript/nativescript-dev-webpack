const { getPath } = require("global-modules-path");

const PROJECT_DATA_GETTERS = {
    appPath: "getAppDirectoryRelativePath",
    appResourcesPath: "getAppResourcesRelativeDirectoryPath",
};

function getProjectData(projectDir) {
    const cli = getNsCli();
    const projectData = cli.projectDataService.getProjectData(projectDir);

    return projectData;
}

function getNsCli() {
    const cliPath = getPath("nativescript", "tns");
    const cli = require(cliPath);

    return cli;
}

module.exports = {
    PROJECT_DATA_GETTERS,
    getProjectData,
};
