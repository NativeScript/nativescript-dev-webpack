module.exports = Object.assign({},
    require("./GenerateBundleStarterPlugin"),
    require("./NativeScriptJsonpPlugin"),
    require("./NativeScriptSnapshotPlugin"),
    require("./PlatformSuffixPlugin"),
    require("./PlatformFSPlugin"),
    require("./WatchStateLoggerPlugin")
);
