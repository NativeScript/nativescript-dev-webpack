import * as path from "path";
import { PlatformFSPlugin, PlatformFSPluginOptions, mapFileSystem } from "./PlatformFSPlugin";
import * as hook from "nativescript-hook";
import * as ngToolsWebpack from "@ngtools/webpack";

// During development the nativescript-dev-webpack plugin may have @ngtools/webpack installed locally as dev-dependency,
// we want to make sure we are using the one installed in the actual app
const projectDir = hook(path.join(__dirname, "..")).findProjectDir();
const ngToolsWebpackDir = path.join(projectDir, "node_modules", "@ngtools", "webpack");
const appNgToolsWebpack: typeof ngToolsWebpack = require(ngToolsWebpackDir);

export const AngularCompilerPlugin: typeof ngToolsWebpack.AngularCompilerPlugin = appNgToolsWebpack.AngularCompilerPlugin;

export interface NativeScriptAngularCompilerPluginOptions extends ngToolsWebpack.AngularCompilerPluginOptions {
    platformOptions?: PlatformFSPluginOptions;
}

export interface CompiledFile {
    outputText: string;
    sourceMap: string;
    errorDependencies: string[];
}

export class NativeScriptAngularCompilerPlugin extends AngularCompilerPlugin {
    readonly options: NativeScriptAngularCompilerPluginOptions;
    readonly targetPlatforms: string[];

    get __compilerHost() {
        // Accessing private API of the AngularCompilerPlugin
        // We need this to augment at least the "resourceNameToFileName" so we can map
        // component.css to component.android.css etc. for platform specific css and html resources.
        return (<any>this)._compilerHost;
    }

    constructor(options: NativeScriptAngularCompilerPluginOptions) {
        super(options);

        this.targetPlatforms = (this.options.platformOptions && this.options.platformOptions.targetPlatforms) || undefined;

        // https://githubcom/angular/angular/blob/7bfeac746e717d02e062fe4a65c008060b8b662c/packages/compiler-cli/src/transformers/api.ts
        const resourceNameToFileName = this.__compilerHost.resourceNameToFileName || function(file, relativeTo) {
            const resolved = path.resolve(path.dirname(relativeTo), file);
            if (this.fileExists(resolved)) {
                return resolved;
            } else {
                return null;
            }
        };
        this.__compilerHost.resourceNameToFileName = function(file, relativeTo) {
            const parsed = path.parse(file);
            let resolved;
            for (const platform of this.targetPlatforms) {
                const platformFile = parsed.name + "." + platform + parsed.ext;
                try {
                    resolved = resourceNameToFileName.call(this, platformFile, relativeTo);
                } catch(e) {
                }
            }

            resolved = resolved || resourceNameToFileName.call(this, file, relativeTo);
            resolved = resolved && resolved.replace(/\\/g, "/");

            return resolved;
        };
    }

    getCompiledFile(this: NativeScriptAngularCompilerPlugin, file: string): CompiledFile {
        for (const platform of this.targetPlatforms) {
            try {
                const parsed = path.parse(file);
                const platformFile = parsed.dir + path.sep + parsed.name + "." + platform + parsed.ext;
                const result = super.getCompiledFile(platformFile);
                return result;
            } catch (e) {
            }
        }

        return super.getCompiledFile(file);
    }

    apply(compiler) {
        super.apply(compiler);
        if (
            this.options.platformOptions &&
            this.options.platformOptions.targetPlatforms &&
            this.options.platformOptions.targetPlatforms.length &&
            this.options.platformOptions.platforms
        ) {
            compiler.plugin('environment', () => {
                compiler.inputFileSystem = mapFileSystem({
                    fs: compiler.inputFileSystem,
                    context: compiler.context,
                    targetPlatforms: this.options.platformOptions.targetPlatforms,
                    platforms: this.options.platformOptions.platforms,
                    ignore: this.options.platformOptions.ignore
                });

                compiler.watchFileSystem = mapFileSystem({
                    fs: compiler.watchFileSystem,
                    context: compiler.context,
                    targetPlatforms: this.options.platformOptions.targetPlatforms,
                    platforms: this.options.platformOptions.platforms,
                    ignore: this.options.platformOptions.ignore
                });
            });
        }
    }
}
