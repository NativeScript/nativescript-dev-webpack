module.exports = () => {
    const update = require("../hot");
    const fileSystemModule = require("tns-core-modules/file-system");
    const applicationFiles = fileSystemModule.knownFolders.currentApp();
    const latestHash = __webpack_require__["h"]();
    return update(latestHash, filename => applicationFiles.getFile(filename));
}