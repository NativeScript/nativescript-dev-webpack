"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const ts = require("typescript");
const transformers_1 = require("@ngtools/webpack/src/transformers");
const compiler_host_1 = require("@ngtools/webpack/src/compiler_host");
function nsReplaceBootstrap(getNgCompiler) {
    const shouldTransform = (fileName) => !fileName.endsWith('.ngfactory.ts') && !fileName.endsWith('.ngstyle.ts');
    const getTypeChecker = () => getNgCompiler().typeChecker;
    const standardTransform = function (sourceFile) {
        const ops = [];
        const ngCompiler = getNgCompiler();
        const entryModule = ngCompiler.entryModule
            ? { path: compiler_host_1.workaroundResolve(ngCompiler.entryModule.path), className: getNgCompiler().entryModule.className }
            : ngCompiler.entryModule;
        if (!shouldTransform(sourceFile.fileName) || !entryModule) {
            return ops;
        }
        // Find all identifiers.
        const entryModuleIdentifiers = transformers_1.collectDeepNodes(sourceFile, ts.SyntaxKind.Identifier)
            .filter(identifier => identifier.text === entryModule.className);
        if (entryModuleIdentifiers.length === 0) {
            return [];
        }
        const relativeEntryModulePath = path_1.relative(path_1.dirname(sourceFile.fileName), entryModule.path);
        const normalizedEntryModulePath = `./${relativeEntryModulePath}`.replace(/\\/g, '/');
        // Find the bootstrap calls.
        entryModuleIdentifiers.forEach(entryModuleIdentifier => {
            // Figure out if it's a `platformNativeScriptDynamic().bootstrapModule(AppModule)` call.
            if (!(entryModuleIdentifier.parent
                && entryModuleIdentifier.parent.kind === ts.SyntaxKind.CallExpression)) {
                return;
            }
            const callExpr = entryModuleIdentifier.parent;
            if (callExpr.expression.kind !== ts.SyntaxKind.PropertyAccessExpression) {
                return;
            }
            const propAccessExpr = callExpr.expression;
            if (propAccessExpr.name.text !== 'bootstrapModule'
                || propAccessExpr.expression.kind !== ts.SyntaxKind.CallExpression) {
                return;
            }
            const bootstrapModuleIdentifier = propAccessExpr.name;
            const innerCallExpr = propAccessExpr.expression;
            if (!(innerCallExpr.expression.kind === ts.SyntaxKind.Identifier
                && innerCallExpr.expression.text === 'platformNativeScriptDynamic')) {
                return;
            }
            const platformBrowserDynamicIdentifier = innerCallExpr.expression;
            const idPlatformBrowser = ts.createUniqueName('__NgCli_bootstrap_');
            const idNgFactory = ts.createUniqueName('__NgCli_bootstrap_');
            // Add the transform operations.
            const factoryClassName = entryModule.className + 'NgFactory';
            const factoryModulePath = normalizedEntryModulePath + '.ngfactory';
            ops.push(
            // Replace the entry module import.
            ...transformers_1.insertStarImport(sourceFile, idNgFactory, factoryModulePath), new transformers_1.ReplaceNodeOperation(sourceFile, entryModuleIdentifier, ts.createPropertyAccess(idNgFactory, ts.createIdentifier(factoryClassName))), 
            // Replace the platformBrowserDynamic import.
            ...transformers_1.insertStarImport(sourceFile, idPlatformBrowser, 'nativescript-angular/platform-static'), new transformers_1.ReplaceNodeOperation(sourceFile, platformBrowserDynamicIdentifier, ts.createPropertyAccess(idPlatformBrowser, 'platformNativeScript')), new transformers_1.ReplaceNodeOperation(sourceFile, bootstrapModuleIdentifier, ts.createIdentifier('bootstrapModuleFactory')));
        });
        return ops;
    };
    return transformers_1.makeTransform(standardTransform, getTypeChecker);
}
exports.nsReplaceBootstrap = nsReplaceBootstrap;
//# sourceMappingURL=ns-replace-bootstrap.js.map