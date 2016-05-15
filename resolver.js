var path = require("path");
var shelljs = require("shelljs");
var createInnerCallback = require("enhanced-resolve/lib/createInnerCallback");

var platform = process.env.PLATFORM;

exports.readPackageJson = function readPackageJson(dir) {
    var packageJson = path.join(dir, "package.json");
    if (shelljs.test("-f", packageJson)) {
        return JSON.parse(shelljs.cat(packageJson));
    } else {
        return {};
    }
};

exports.getPackageMain = function(packageDir) {
    if (shelljs.test("-f", packageDir + ".js")) {
        return packageDir + ".js";
    }

    var data = exports.readPackageJson(packageDir);
    if (data.main) {
        var main = data.main;
        if (/\.js$/i.test(main)) {
            return path.join(packageDir, main);
        } else {
            return path.join(packageDir, main + ".js");
        }
    } else {
        var indexPath = path.join(packageDir, "index.js");
        if (shelljs.test("-f", indexPath)) {
            return path.join(packageDir, "index.js");
        } else {
            throw new Error("Main module not found for: " + packageDir);
        }
    }
};

exports.TnsResolver = {
    apply: function(resolver) {
        var plugin = this;
        resolver.plugin('module', function(request, callback) {
            var resolvedFile = null;
            var moduleName = request.request;
            if (plugin.isCoreDirModule(moduleName)) {
                resolvedFile = plugin.resolveCoreDirModule(moduleName);
            } else if (plugin.isCoreFileModule(moduleName)) {
                var tnsPath = path.join("node_modules/tns-core-modules", moduleName);
                resolvedFile = plugin.resolveFileModule(tnsPath);
            } else if (plugin.isNonCoreFileModule(moduleName)) {
                resolvedFile = plugin.resolveNonCoreFileModule(moduleName);
            } else if (plugin.isNonCoreDirModule(moduleName)) {
                resolvedFile = plugin.resolveNonCoreDirModule(moduleName);
            } else  if (plugin.isAppFileModule(moduleName)) {
                resolvedFile = plugin.resolveAppFileModule(moduleName);
            } else if (plugin.isAppDirModule(moduleName)) {
                resolvedFile = plugin.resolveAppDirModule(moduleName);
            }

            if (!resolvedFile) {
                // "Normal" module, resolve with given callback.
                callback();
                return;
            }

            // Resolve to discovered "real" module name.
            //
            // Taken from "enhanced-resolve@0.9.1", ModuleAliasPlugin.js
            var newRequestStr = resolvedFile;
            var newRequest = this.parse(newRequestStr);
            var obj = {
                path: request.path,
                request: newRequest.path,
                query: newRequest.query,
                directory: newRequest.directory
            };
            var newCallback = createInnerCallback(callback, callback, "aliased with mapping " + JSON.stringify(moduleName) + " to " + JSON.stringify(resolvedFile));
            if(newRequest.module) return this.doResolve("module", obj, newCallback);
            if(newRequest.directory) return this.doResolve("directory", obj, newCallback);
            return this.doResolve(["file", "directory"], obj, newCallback);
        });
    },
    isCoreDirModule: function(moduleName) {
        var tnsPath = path.join("node_modules/tns-core-modules", moduleName);
        return shelljs.test("-d", tnsPath);
    },
    isNonCoreDirModule: function(moduleName) {
        var modulePath = path.join("node_modules", moduleName);
        return shelljs.test("-d", modulePath);
    },
    resolveCoreDirModule: function(tnsModule) {
        var tnsPath = path.join("node_modules/tns-core-modules", tnsModule);
        return this.getDirModule(tnsPath);
    },
    resolveNonCoreDirModule: function(moduleName) {
        var modulePath = path.join("node_modules", moduleName);
        return this.getDirModule(modulePath);
    },
    getDirModule: function(modulePath) {
        var mainModule = exports.getPackageMain(modulePath);
        return this.resolveFileModule(mainModule);
    },
    resolveFileModule: function(tnsModule) {
        var result = tnsModule;
        if (shelljs.test("-f", tnsModule)) {
            result = tnsModule;
        } else if (shelljs.test("-f", tnsModule + ".js")) {
            result = tnsModule + ".js";
        } else {
            var platformMainModule = this.getPlatformModule(platform, tnsModule);
            if (shelljs.test("-f", platformMainModule)) {
                result = platformMainModule;
            } else {
                throw new Error("File module not found for: " + tnsModule);
            }
        }
        return result.replace(/^node_modules\/?/i, "");
    },
    resolveNonCoreFileModule: function(moduleName) {
        var nodeModulesPath = path.join("node_modules", moduleName);
        try {
            return this.resolveFileModule(nodeModulesPath);
        } catch (e) {
            return null;
        }
    },
    isCoreFileModule: function(moduleName) {
        var tnsPath = path.join("node_modules/tns-core-modules", moduleName);
        try {
            this.resolveFileModule(tnsPath);
            return true;
        } catch (e) {
            return false;
        }
    },
    getPlatformModule: function(platform, modulePath) {
        var noExtension = modulePath.replace(/\.js$/i, "");
        return noExtension + "." + platform + ".js";
    },
    isNonCoreFileModule: function(moduleFile) {
        return shelljs.test("-f", moduleFile);
    },
    isAppFileModule: function (moduleName) {
        var modulePath = path.resolve(__dirname, "..", "..", "app", moduleName.replace(/^~/, "."));
        return shelljs.test("-f", modulePath + ".js") || shelljs.test("-f", this.getPlatformModule(platform, modulePath));
    },
    resolveAppFileModule: function (moduleName) {
        var modulePath = path.resolve(__dirname, "..", "..", "app", moduleName.replace(/^~/, "."));
        try {
            return this.resolveFileModule(modulePath);
        } catch (e) {
            return null;
        }
    },
    isAppDirModule: function (moduleName) {
        var modulePath = path.resolve(__dirname, "..", "..", "app", moduleName.replace(/^~/, "."));
        return shelljs.test("-d", modulePath);
    },
        resolveAppDirModule: function (moduleName) {
        var modulePath = path.resolve(__dirname, "..", "..", "app", moduleName.replace(/^~/, "."));
        return this.getDirModule(modulePath);
    },
};
