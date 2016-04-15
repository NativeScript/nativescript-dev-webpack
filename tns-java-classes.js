//Resolve JavaScript classes that extend a Java class, and need to resolve
//their JavaScript module from a bundled script. For example:
//NativeScriptApplication, NativeScriptActivity, etc.
//
//This module gets bundled together with the rest of the app code and the
//`require` calls get resolved to the correct bundling import call.
//
//At runtime the module gets loaded *before* the rest of the app code, so code
//placed here needs to be careful about its dependencies.

if (global.TNS_WEBPACK) {
    require("application");
    require("ui/frame");

    global.__requireOverride = function (name, dir) {
        if (name === "application") {
            return require("application");
        }
        else if (name === "ui/frame") {
            return require("ui/frame");
        }
    };
}
