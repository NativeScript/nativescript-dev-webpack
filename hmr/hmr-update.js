module.exports = () => {
    const update = require("../hot");
    const fileSystemModule = require("tns-core-modules/file-system");
    const applicationFiles = fileSystemModule.knownFolders.currentApp();
    return update(__webpack_require__["h"](), filename => applicationFiles.getFile(filename));
}