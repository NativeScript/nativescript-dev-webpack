"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const PlatformFSPlugin_1 = require("./PlatformFSPlugin");
const hook = require("nativescript-hook");
// During development the nativescript-dev-webpack plugin may have @ngtools/webpack installed locally as dev-dependency,
// we want to make sure we are using the one installed in the actual app
const projectDir = hook(path.join(__dirname, "..")).findProjectDir();
const ngToolsWebpackDir = path.join(projectDir, "node_modules", "@ngtools", "webpack");
const appNgToolsWebpack = require(ngToolsWebpackDir);
exports.AngularCompilerPlugin = appNgToolsWebpack.AngularCompilerPlugin;
class NativeScriptAngularCompilerPlugin extends exports.AngularCompilerPlugin {
    get __compilerHost() {
        // Accessing private API of the AngularCompilerPlugin
        // We need this to augment at least the "resourceNameToFileName" so we can map
        // component.css to component.android.css etc. for platform specific css and html resources.
        return this._compilerHost;
    }
    constructor(options) {
        super(options);
        this.platform = (this.options.platformOptions && this.options.platformOptions.platform) || undefined;
        const platform = this.platform;
        if (platform) {
            // https://github.com/angular/angular/blob/7bfeac746e717d02e062fe4a65c008060b8b662c/packages/compiler-cli/src/transformers/api.ts
            const resourceNameToFileName = this.__compilerHost.resourceNameToFileName || function (file, relativeTo) {
                const resolved = path.resolve(path.dirname(relativeTo), file);
                if (this.fileExists(resolved)) {
                    return resolved;
                }
                else {
                    return null;
                }
            };
            this.__compilerHost.resourceNameToFileName = function (file, relativeTo) {
                const parsed = path.parse(file);
                const platformFile = parsed.name + "." + platform + parsed.ext;
                let resolved;
                try {
                    resolved = resourceNameToFileName.call(this, platformFile, relativeTo);
                }
                catch (e) {
                }
                resolved = resolved || resourceNameToFileName.call(this, file, relativeTo);
                return resolved;
            };
        }
    }
    getCompiledFile(file) {
        try {
            if (this.platform) {
                const parsed = path.parse(file);
                const platformFile = parsed.dir + path.sep + parsed.name + "." + this.platform + parsed.ext;
                const result = super.getCompiledFile(platformFile);
                return result;
            }
        }
        catch (e) {
        }
        return super.getCompiledFile(file);
    }
    apply(compiler) {
        super.apply(compiler);
        if (this.options.platformOptions && this.options.platformOptions.platform && this.options.platformOptions.platforms) {
            compiler.plugin('environment', () => {
                compiler.inputFileSystem = PlatformFSPlugin_1.mapFileSystem({
                    fs: compiler.inputFileSystem,
                    context: compiler.context,
                    platform: this.options.platformOptions.platform,
                    platforms: this.options.platformOptions.platforms,
                    ignore: this.options.platformOptions.ignore
                });
                compiler.watchFileSystem = PlatformFSPlugin_1.mapFileSystem({
                    fs: compiler.watchFileSystem,
                    context: compiler.context,
                    platform: this.options.platformOptions.platform,
                    platforms: this.options.platformOptions.platforms,
                    ignore: this.options.platformOptions.ignore
                });
            });
        }
    }
}
exports.NativeScriptAngularCompilerPlugin = NativeScriptAngularCompilerPlugin;
//# sourceMappingURL=NativeScriptAngularCompilerPlugin.js.map