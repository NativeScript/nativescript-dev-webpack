import * as ts from 'typescript';

export function getFirstNode(sourceFile: ts.SourceFile): ts.Node {
    if (sourceFile.statements.length > 0) {
        return sourceFile.statements[0];
    }
    return sourceFile.getChildAt(0);
}
