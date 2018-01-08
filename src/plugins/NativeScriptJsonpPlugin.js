const { ConcatSources } = require("webpack-sources");

const WINDOWS_GLOBAL_MATCHER = /window\["nativescriptJsonp"\]/g;
const NATIVESCRIPT_GLOBAL = "global[\"nativescriptJsonp\"]";
const isVendorChunk = name => name === "vendor.js";

//HACK: changes the JSONP chunk eval function to `global["nativescriptJsonp"]`
// applied to tns-java-classes.js only
exports.NativeScriptJsonpPlugin = (function() {
    function NativeScriptJsonpPlugin() {
    }

    NativeScriptJsonpPlugin.prototype.apply = function (compiler) {
        compiler.plugin("compilation", function (compilation) {
            compilation.plugin("optimize-chunk-assets", function (chunks, callback) {
                chunks.forEach(function (chunk) {
                    chunk.files
                        .filter(isVendorChunk)
                        .forEach(file => replaceGlobal(compilation.assets, file));
                });
                callback();
            });
        });
    };

    return NativeScriptJsonpPlugin;
})();

function replaceGlobal(assets, file) {
    const path = assets[file];
    const source = path.source();
    const match = source.match(WINDOWS_GLOBAL_MATCHER);

    if (match) {
        const newSource = source.replace(WINDOWS_GLOBAL_MATCHER, NATIVESCRIPT_GLOBAL);
        assets[file] = new ConcatSource(newSource);
    }
}
