import { dirname, relative } from 'path';
import * as ts from 'typescript';
import {
    StandardTransform,
    TransformOperation,
    collectDeepNodes,
    insertStarImport,
    ReplaceNodeOperation,
    makeTransform,
    getFirstNode
} from "@ngtools/webpack/src/transformers";
import {
    getExpressionName
} from "../utils/ast-utils";
import { AngularCompilerPlugin } from '@ngtools/webpack';
import { getResolvedEntryModule } from "../utils/transformers-utils";

// TODO: check https://github.com/angular/angular-cli/commit/7347d881925130ce325009588b20d5b39ac73258#diff-6b9947d457bac2310a5d25e102697423R85
export function nsReplaceBootstrap(getNgCompiler: () => AngularCompilerPlugin): ts.TransformerFactory<ts.SourceFile> {
    const shouldTransform = (fileName) => !fileName.endsWith('.ngfactory.ts') && !fileName.endsWith('.ngstyle.ts');
    const getTypeChecker = () => getNgCompiler().typeChecker;

    const standardTransform: StandardTransform = function (sourceFile: ts.SourceFile) {
        const ops: TransformOperation[] = [];
        const entryModule = getResolvedEntryModule(getNgCompiler());

        if (!shouldTransform(sourceFile.fileName) || !entryModule) {
            return ops;
        }

        // Find all identifiers.
        const entryModuleIdentifiers = collectDeepNodes<ts.Identifier>(sourceFile,
            ts.SyntaxKind.Identifier)
            .filter(identifier => identifier.text === entryModule.className);

        if (entryModuleIdentifiers.length === 0) {
            return [];
        }

        const relativeEntryModulePath = relative(dirname(sourceFile.fileName), entryModule.path);
        const normalizedEntryModulePath = `./${relativeEntryModulePath}`.replace(/\\/g, '/');

        // Find the bootstrap calls.
        entryModuleIdentifiers.forEach(entryModuleIdentifier => {
            // Figure out if it's a `platformNativeScriptDynamic().bootstrapModule(AppModule)` call.
            if (!(
                entryModuleIdentifier.parent
                && entryModuleIdentifier.parent.kind === ts.SyntaxKind.CallExpression
            )) {
                return;
            }

            const bootstrapCallExpr = entryModuleIdentifier.parent as ts.CallExpression;

            if (bootstrapCallExpr.expression.kind !== ts.SyntaxKind.PropertyAccessExpression) {
                return;
            }

            const bootstrapPropAccessExpr = bootstrapCallExpr.expression as ts.PropertyAccessExpression;

            if (bootstrapPropAccessExpr.name.text !== 'bootstrapModule'
                || bootstrapPropAccessExpr.expression.kind !== ts.SyntaxKind.CallExpression) {
                return;
            }

            const nsPlatformCallExpr = bootstrapPropAccessExpr.expression as ts.CallExpression;
            if (!(getExpressionName(nsPlatformCallExpr.expression) === 'platformNativeScriptDynamic')) {
                return;
            }

            const idPlatformNativeScript = ts.createUniqueName('__NgCli_bootstrap_1');
            const idNgFactory = ts.createUniqueName('__NgCli_bootstrap_2');

            const firstNode = getFirstNode(sourceFile);

            // Add the transform operations.
            // TODO: if (ivy)
            const factoryClassName = entryModule.className; // + 'NgFactory';
            const factoryModulePath = normalizedEntryModulePath; // + '.ngfactory';


            const newBootstrapPropAccessExpr = ts.getMutableClone(bootstrapPropAccessExpr);
            const newNsPlatformCallExpr = ts.getMutableClone(bootstrapPropAccessExpr.expression) as ts.CallExpression;
            newNsPlatformCallExpr.expression = ts.createPropertyAccess(idPlatformNativeScript, 'platformNativeScript');
            newBootstrapPropAccessExpr.expression = newNsPlatformCallExpr;
            // TODO: if (ivy)
            // newBootstrapPropAccessExpr.name = ts.createIdentifier("bootstrapModuleFactory");
            newBootstrapPropAccessExpr.name = ts.createIdentifier("bootstrapModule");

            const newBootstrapCallExpr = ts.getMutableClone(bootstrapCallExpr);
            newBootstrapCallExpr.expression = newBootstrapPropAccessExpr;
            newBootstrapCallExpr.arguments = ts.createNodeArray([
                ts.createPropertyAccess(idNgFactory, ts.createIdentifier(factoryClassName))
            ]);

            ops.push(
                // Insert an import of the {N} Angular static bootstrap module in the beginning of the file:
                // import * as __NgCli_bootstrap_2 from "nativescript-angular/platform-static";
                ...insertStarImport(
                    sourceFile,
                    idPlatformNativeScript,
                    'nativescript-angular/platform-static',
                    firstNode,
                    true,
                ),

                // Insert an import of the module factory in the beginning of the file:
                // import * as __NgCli_bootstrap_1 from "./app.module.ngfactory";
                ...insertStarImport(
                    sourceFile,
                    idNgFactory,
                    factoryModulePath,
                    firstNode,
                    true,
                ),

                // Replace the bootstrap call expression. For example:
                // from: platformNativeScriptDynamic().bootstrapModule(AppModule);
                // to:   platformNativeScript().bootstrapModuleFactory(__NgCli_bootstrap_2.AppModuleNgFactory);
                new ReplaceNodeOperation(sourceFile, bootstrapCallExpr, newBootstrapCallExpr),
            );
        });

        return ops;
    };

    return makeTransform(standardTransform, getTypeChecker);
}
