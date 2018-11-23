// inspired by:
// https://github.com/angular/angular-cli/blob/d202480a1707be6575b2c8cf0383cfe6db44413c/packages/schematics/angular/utility/ast-utils.ts
// https://github.com/angular/angular-cli/blob/d202480a1707be6575b2c8cf0383cfe6db44413c/packages/schematics/angular/utility/ng-ast-utils.ts
// https://github.com/NativeScript/nativescript-schematics/blob/438b9e3ef613389980bfa9d071e28ca1f32ab04f/src/ast-utils.ts

import { dirname, join } from 'path';
import * as ts from 'typescript';
const { readFileSync, existsSync } = require("fs");

export function findBootstrapModuleCall(mainPath: string): ts.CallExpression | null {
    if (!existsSync(mainPath)) {
        throw new Error(`Main file (${mainPath}) not found`);
    }
    const mainText = readFileSync(mainPath, "utf8");

    const source = ts.createSourceFile(mainPath, mainText, ts.ScriptTarget.Latest, true);

    const allNodes = getSourceNodes(source);

    let bootstrapCall: ts.CallExpression | null = null;

    for (const node of allNodes) {

        let bootstrapCallNode: ts.Node | null = null;
        bootstrapCallNode = findNode(node, ts.SyntaxKind.Identifier, 'bootstrapModule');

        // Walk up the parent until CallExpression is found.
        while (bootstrapCallNode && bootstrapCallNode.parent
            && bootstrapCallNode.parent.kind !== ts.SyntaxKind.CallExpression) {

            bootstrapCallNode = bootstrapCallNode.parent;
        }

        if (bootstrapCallNode !== null &&
            bootstrapCallNode.parent !== undefined &&
            bootstrapCallNode.parent.kind === ts.SyntaxKind.CallExpression) {
            bootstrapCall = bootstrapCallNode.parent as ts.CallExpression;
            break;
        }
    }

    return bootstrapCall;
}

export function findBootstrapModulePath(mainPath: string): string {
    const bootstrapCall = findBootstrapModuleCall(mainPath);
    if (!bootstrapCall) {
        throw new Error('Bootstrap call not found');
    }

    const bootstrapModule = bootstrapCall.arguments[0];
    if (!existsSync(mainPath)) {
        throw new Error(`Main file (${mainPath}) not found`);
    }
    const mainText = readFileSync(mainPath, "utf8");

    const source = ts.createSourceFile(mainPath, mainText, ts.ScriptTarget.Latest, true);
    const allNodes = getSourceNodes(source);
    const bootstrapModuleRelativePath = allNodes
        .filter(node => node.kind === ts.SyntaxKind.ImportDeclaration)
        .filter(imp => {
            return findNode(imp, ts.SyntaxKind.Identifier, bootstrapModule.getText());
        })
        .map((imp: ts.ImportDeclaration) => {
            const modulePathStringLiteral = imp.moduleSpecifier as ts.StringLiteral;

            return modulePathStringLiteral.text;
        })[0];

    return bootstrapModuleRelativePath;
}

export function getAppModulePath(mainPath: string): string {
    const moduleRelativePath = findBootstrapModulePath(mainPath);
    const mainDir = dirname(mainPath);
    const modulePath = join(mainDir, `${moduleRelativePath}.ts`);

    return modulePath;
}

export function findNode(node: ts.Node, kind: ts.SyntaxKind, text: string): ts.Node | null {
    if (node.kind === kind && node.getText() === text) {
        // throw new Error(node.getText());
        return node;
    }

    let foundNode: ts.Node | null = null;
    ts.forEachChild(node, childNode => {
        foundNode = foundNode || findNode(childNode, kind, text);
    });

    return foundNode;
}

export function getSourceNodes(sourceFile: ts.SourceFile): ts.Node[] {
    const nodes: ts.Node[] = [sourceFile];
    const result = [];

    while (nodes.length > 0) {
        const node = nodes.shift();

        if (node) {
            result.push(node);
            if (node.getChildCount(sourceFile) >= 0) {
                nodes.unshift(...node.getChildren());
            }
        }
    }

    return result;
}


export function getObjectPropertyMatches(objectNode: ts.ObjectLiteralExpression, sourceFile: ts.SourceFile, targetPropertyName: string): ts.ObjectLiteralElement[] {
    return objectNode.properties
        .filter(prop => prop.kind == ts.SyntaxKind.PropertyAssignment)
        .filter((prop: ts.PropertyAssignment) => {
            const name = prop.name;
            switch (name.kind) {
                case ts.SyntaxKind.Identifier:
                    return (name as ts.Identifier).getText(sourceFile) == targetPropertyName;
                case ts.SyntaxKind.StringLiteral:
                    return (name as ts.StringLiteral).text == targetPropertyName;
            }
            return false;
        });
}