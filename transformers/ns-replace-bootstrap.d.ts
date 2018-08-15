import * as ts from 'typescript';
import { AngularCompilerPlugin } from '@ngtools/webpack';
export declare function nsReplaceBootstrap(getNgCompiler: () => AngularCompilerPlugin): ts.TransformerFactory<ts.SourceFile>;
