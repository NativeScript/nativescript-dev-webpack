import { PlatformFSPluginOptions } from "./PlatformFSPlugin";
import * as ngToolsWebpack from "@ngtools/webpack";
export declare const AngularCompilerPlugin: typeof ngToolsWebpack.AngularCompilerPlugin;
export interface NativeScriptAngularCompilerPluginOptions extends ngToolsWebpack.AngularCompilerPluginOptions {
    platformOptions?: PlatformFSPluginOptions;
}
export interface CompiledFile {
    outputText: string;
    sourceMap: string;
    errorDependencies: string[];
}
export declare class NativeScriptAngularCompilerPlugin extends AngularCompilerPlugin {
    readonly options: NativeScriptAngularCompilerPluginOptions;
    readonly platform: string;
    readonly __compilerHost: any;
    constructor(options: NativeScriptAngularCompilerPluginOptions);
    getCompiledFile(this: NativeScriptAngularCompilerPlugin, file: string): CompiledFile;
    apply(compiler: any): void;
}
