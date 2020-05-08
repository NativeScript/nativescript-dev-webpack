// inspired by:
// https://github.com/angular/angular-cli/blob/d202480a1707be6575b2c8cf0383cfe6db44413c/packages/schematics/angular/utility/ast-utils.ts
// https://github.com/angular/angular-cli/blob/d202480a1707be6575b2c8cf0383cfe6db44413c/packages/schematics/angular/utility/ng-ast-utils.ts
// https://github.com/NativeScript/nativescript-schematics/blob/438b9e3ef613389980bfa9d071e28ca1f32ab04f/src/ast-utils.ts

import { dirname, basename, extname, join, normalize } from "path";
import * as ts from "typescript";
import {
    StandardTransform,
    TransformOperation,
    collectDeepNodes,
    AddNodeOperation,
    ReplaceNodeOperation,
    makeTransform
} from "@ngtools/webpack/src/transformers";
import { AngularCompilerPlugin } from "@ngtools/webpack";
import { findIdentifierNode, getObjectPropertyMatches, getDecoratorMetadata } from "../utils/ast-utils";
import { getResolvedEntryModule } from "../utils/transformers-utils";

export function nsReplaceLazyLoader(getNgCompiler: () => AngularCompilerPlugin, entryPath: string, projectDir: string): ts.TransformerFactory<ts.SourceFile> {
    const getTypeChecker = () => getNgCompiler().typeChecker;

    const standardTransform: StandardTransform = function (sourceFile: ts.SourceFile) {
        let ops: TransformOperation[] = [];
        const entryModule = getResolvedEntryModule(getNgCompiler(), projectDir);
        const sourceFilePath = join(dirname(sourceFile.fileName), basename(sourceFile.fileName, extname(sourceFile.fileName)));
        if (!entryModule || normalize(sourceFilePath) !== normalize(entryModule.path)) {
            return ops;
        }

        try {
            ops = addArrayPropertyValueToNgModule(sourceFile, "providers", "NgModuleFactoryLoader", "{ provide: nsNgCoreImport_Generated.NgModuleFactoryLoader, useClass: NSLazyModulesLoader_Generated }") || [];
        } catch (e) {
            ops = [];
        }

        return ops;
    };

    return makeTransform(standardTransform, getTypeChecker);
}

export function addArrayPropertyValueToNgModule(
    sourceFile: ts.SourceFile,
    targetPropertyName: string,
    newPropertyValueMatch: string,
    newPropertyValue: string
): TransformOperation[] {
    const ngModuleConfigNodesInFile = getDecoratorMetadata(sourceFile, "NgModule", "@angular/core");
    let ngModuleConfigNode: any = ngModuleConfigNodesInFile && ngModuleConfigNodesInFile[0];
    if (!ngModuleConfigNode) {
        return null;
    }

    const importsInFile = collectDeepNodes(sourceFile, ts.SyntaxKind.ImportDeclaration);
    const lastImport = importsInFile && importsInFile[importsInFile.length - 1];
    if (!lastImport) {
        return null;
    }

    const ngLazyLoaderNode = ts.createIdentifier(NgLazyLoaderCode);
    if (ngModuleConfigNode.kind === ts.SyntaxKind.Identifier) {
        const ngModuleConfigIndentifierNode = ngModuleConfigNode as ts.Identifier;
        // cases like @NgModule(myCoolConfig)
        const configObjectDeclarationNodes = collectDeepNodes<ts.Node>(sourceFile, ts.SyntaxKind.VariableStatement).filter(imp => {
            return findIdentifierNode(imp, ngModuleConfigIndentifierNode.getText());
        });
        // will be undefined when the object is imported from another file
        const configObjectDeclaration = (configObjectDeclarationNodes && configObjectDeclarationNodes[0]);

        const configObjectName = (<string>ngModuleConfigIndentifierNode.escapedText).trim();
        const configObjectSetupCode = getConfigObjectSetupCode(configObjectName, targetPropertyName, newPropertyValueMatch, newPropertyValue);
        const configObjectSetupNode = ts.createIdentifier(configObjectSetupCode);

        return [
            new AddNodeOperation(sourceFile, lastImport, undefined, ngLazyLoaderNode),
            new AddNodeOperation(sourceFile, configObjectDeclaration || lastImport, undefined, configObjectSetupNode)
        ];
    } else if (ngModuleConfigNode.kind === ts.SyntaxKind.ObjectLiteralExpression) {
        // cases like @NgModule({ bootstrap: ... })
        const ngModuleConfigObjectNode = ngModuleConfigNode as ts.ObjectLiteralExpression;
        const matchingProperties: ts.ObjectLiteralElement[] = getObjectPropertyMatches(ngModuleConfigObjectNode, sourceFile, targetPropertyName);
        if (!matchingProperties) {
            // invalid object
            return null;
        }

        if (matchingProperties.length === 0) {
            if (ngModuleConfigObjectNode.properties.length === 0) {
                // empty object @NgModule({ })
                return null;
            }

            // the target field is missing, we will insert it @NgModule({ otherProps })
            const lastConfigObjPropertyNode = ngModuleConfigObjectNode.properties[ngModuleConfigObjectNode.properties.length - 1];

            const newTargetPropertyNode = ts.createPropertyAssignment(targetPropertyName, ts.createIdentifier(`[${newPropertyValue}]`));

            return [
                new AddNodeOperation(sourceFile, lastConfigObjPropertyNode, undefined, newTargetPropertyNode),
                new AddNodeOperation(sourceFile, lastImport, undefined, ngLazyLoaderNode)
            ];

        }

        // the target property is found
        const targetPropertyNode = matchingProperties[0] as ts.PropertyAssignment;
        if (targetPropertyNode.initializer.kind !== ts.SyntaxKind.ArrayLiteralExpression) {
            // not an array
            return null;
        }

        const targetPropertyValuesNode = targetPropertyNode.initializer as ts.ArrayLiteralExpression;
        const targetPropertyValues = targetPropertyValuesNode.elements;
        if (targetPropertyValues.length > 0) {
            // @NgModule({ targetProperty: [ someValues ] })
            const targetPropertyValuesStrings = targetPropertyValues.map(node => node.getText());
            const wholeWordPropValueRegex = new RegExp("\\b" + newPropertyValueMatch + "\\b");
            if (targetPropertyValuesStrings.some(((value) => wholeWordPropValueRegex.test(value)))) {
                // already registered
                return null;
            }

            const lastPropertyValueNode = targetPropertyValues[targetPropertyValues.length - 1];
            const newPropertyValueNode = ts.createIdentifier(`${newPropertyValue}`);

            return [
                new AddNodeOperation(sourceFile, lastPropertyValueNode, undefined, newPropertyValueNode),
                new AddNodeOperation(sourceFile, lastImport, undefined, ngLazyLoaderNode)
            ];
        } else {
            // empty array @NgModule({ targetProperty: [ ] })
            const newTargetPropertyValuesNode = ts.createIdentifier(`[${newPropertyValue}]`);

            return [
                new ReplaceNodeOperation(sourceFile, targetPropertyValuesNode, newTargetPropertyValuesNode),
                new AddNodeOperation(sourceFile, lastImport, undefined, ngLazyLoaderNode)
            ];
        }
    }
}

// handles cases like @NgModule(myCoolConfig) by returning a code snippet for processing
// the config object and configuring its {{targetPropertyName}} based on the specified arguments
// e.g.
// if (!myCoolConfig.providers) {
//     myCoolConfig.providers = [];
// }
// if (Array.isArray(myCoolConfig.providers)) {
//     var wholeWordPropertyRegex = new RegExp("\bNgModuleFactoryLoader\b");
//     if (!myCoolConfig.providers.some(function (property) { return wholeWordPropertyRegex.test(property); })) {
//         myCoolConfig.providers.push({ provide: nsNgCoreImport_Generated.NgModuleFactoryLoader, useClass: NSLazyModulesLoader_Generated });
//     }
// }
export function getConfigObjectSetupCode(configObjectName: string, targetPropertyName: string, newPropertyValueMatch: string, newPropertyValue: string) {
    return `
if (!${configObjectName}.${targetPropertyName}) {
    ${configObjectName}.${targetPropertyName} = [];
}
if (Array.isArray(${configObjectName}.${targetPropertyName})) {
    var wholeWordPropertyRegex = new RegExp("\\b${newPropertyValueMatch}\\b");
    if (!${configObjectName}.${targetPropertyName}.some(function (property) { return wholeWordPropertyRegex.test(property); })) {
        ${configObjectName}.${targetPropertyName}.push(${newPropertyValue});
    }
}
`;
}

// based on: https://github.com/angular/angular/blob/4c2ce4e8ba4c5ac5ce8754d67bc6603eaad4564a/packages/core/src/linker/system_js_ng_module_factory_loader.ts
// when @angular/core is an external module, this fixes https://github.com/NativeScript/nativescript-cli/issues/4024 by including the lazy loader INSIDE the bundle allowing it to access the lazy modules
export const NgLazyLoaderCode = `
var nsNgCoreImport_Generated = require("@angular/core");
var NSLazyModulesLoader_Generated = /** @class */ (function () {
    function NSLazyModulesLoader_Generated(_compiler, config) {
        this._compiler = _compiler;
        this._config = config || {
            factoryPathPrefix: '',
            factoryPathSuffix: '.ngfactory',
        };
    }
    NSLazyModulesLoader_Generated.prototype.load = function (path) {
        var offlineMode = this._compiler instanceof nsNgCoreImport_Generated.Compiler;
        return offlineMode ? this.loadFactory(path) : this.loadAndCompile(path);
    };
    NSLazyModulesLoader_Generated.prototype.loadAndCompile = function (path) {
        var _this = this;
        var _a = path.split('#'), module = _a[0], exportName = _a[1];
        if (exportName === undefined) {
            exportName = 'default';
        }
        return import(module)
            .then(function (module) { return module[exportName]; })
            .then(function (type) { return _this.checkNotEmpty(type, module, exportName); })
            .then(function (type) { return _this._compiler.compileModuleAsync(type); });
    };
    NSLazyModulesLoader_Generated.prototype.loadFactory = function (path) {
        var _this = this;
        var _a = path.split('#'), module = _a[0], exportName = _a[1];
        var factoryClassSuffix = 'NgFactory';
        if (exportName === undefined) {
            exportName = 'default';
            factoryClassSuffix = '';
        }
        return import(this._config.factoryPathPrefix + module + this._config.factoryPathSuffix)
            .then(function (module) { return module[exportName + factoryClassSuffix]; })
            .then(function (factory) { return _this.checkNotEmpty(factory, module, exportName); });
    };
    NSLazyModulesLoader_Generated.prototype.checkNotEmpty = function (value, modulePath, exportName) {
        if (!value) {
            throw new Error("Cannot find '" + exportName + "' in '" + modulePath + "'");
        }
        return value;
    };
    NSLazyModulesLoader_Generated = __decorate([
        nsNgCoreImport_Generated.Injectable(),
        __param(1, nsNgCoreImport_Generated.Optional()),
        __metadata("design:paramtypes", [nsNgCoreImport_Generated.Compiler, nsNgCoreImport_Generated.SystemJsNgModuleLoaderConfig])
    ], NSLazyModulesLoader_Generated);
    return NSLazyModulesLoader_Generated;
}());
`;
