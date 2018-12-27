import { workaroundResolve } from "@ngtools/webpack/src/compiler_host";
import { AngularCompilerPlugin } from "@ngtools/webpack";

export function getResolvedEntryModule(ngCompiler: AngularCompilerPlugin) {
    return ngCompiler.entryModule
        ? { path: workaroundResolve(ngCompiler.entryModule.path), className: ngCompiler.entryModule.className }
        : ngCompiler.entryModule;
}