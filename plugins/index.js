module.exports = Object.assign({},
    require("./GenerateBundleStarterPlugin"),
    require("./NativeScriptSnapshotPlugin"),
    require("./PlatformSuffixPlugin"),
    require("./PlatformFSPlugin"),
    require("./WatchStateLoggerPlugin")
);
