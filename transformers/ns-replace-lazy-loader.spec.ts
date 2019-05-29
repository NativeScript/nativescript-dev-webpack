import { tags } from "@angular-devkit/core";
import { createTypescriptContext, transformTypescript } from "@ngtools/webpack/src/transformers";
import { nsReplaceLazyLoader, NgLazyLoaderCode, getConfigObjectSetupCode } from "./ns-replace-lazy-loader";
import { AngularCompilerPlugin } from "@ngtools/webpack";

describe("@ngtools/webpack transformers", () => {
    describe("ns-replace-lazy-loader", () => {
        const configObjectName = "testIdentifier";
        const configObjectSetupCode = getConfigObjectSetupCode(configObjectName, "providers", "NgModuleFactoryLoader", "{ provide: nsNgCoreImport_Generated.NgModuleFactoryLoader, useClass: NSLazyModulesLoader_Generated }");
        const testCases = [
            {
                name: "should add providers and NgModuleFactoryLoader when providers is missing",
                rawAppModule: `
                    import { NgModule } from "@angular/core";
                    import { NativeScriptModule } from "nativescript-angular/nativescript.module";
                    import { AppComponent } from "./app.component";

                    @NgModule({
                        bootstrap: [
                            AppComponent
                        ],
                        imports: [
                            NativeScriptModule
                        ],
                        declarations: [
                            AppComponent,
                        ]
                    })
                    export class AppModule { }
              `,
                transformedAppModule: `
                    import * as tslib_1 from "tslib"; import { NgModule } from "@angular/core";
                    import { NativeScriptModule } from "nativescript-angular/nativescript.module";
                    import { AppComponent } from "./app.component";
                    ${NgLazyLoaderCode}
                    let AppModule = class AppModule { };
                    AppModule = tslib_1.__decorate([ NgModule({
                        bootstrap: [ AppComponent ],
                        imports: [ NativeScriptModule ],
                        declarations: [ AppComponent, ],
                        providers: [{ provide: nsNgCoreImport_Generated.NgModuleFactoryLoader, useClass: NSLazyModulesLoader_Generated }] })
                    ],
                    AppModule);
                    export { AppModule };`
            },
            {
                name: "should add NgModuleFactoryLoader when the providers array is empty",
                rawAppModule: `
                    import { NgModule } from "@angular/core";
                    import { NativeScriptModule } from "nativescript-angular/nativescript.module";
                    import { AppComponent } from "./app.component";

                    @NgModule({
                        bootstrap: [
                            AppComponent
                        ],
                        imports: [
                            NativeScriptModule
                        ],
                        declarations: [
                            AppComponent,
                        ],
                        providers: []
                    })
                    export class AppModule { }
              `,
                transformedAppModule: `
                    import * as tslib_1 from "tslib"; import { NgModule } from "@angular/core";
                    import { NativeScriptModule } from "nativescript-angular/nativescript.module";
                    import { AppComponent } from "./app.component";
                    ${NgLazyLoaderCode}
                    let AppModule = class AppModule { };
                    AppModule = tslib_1.__decorate([ NgModule({
                        bootstrap: [ AppComponent ],
                        imports: [ NativeScriptModule ],
                        declarations: [ AppComponent, ],
                        providers: [{ provide: nsNgCoreImport_Generated.NgModuleFactoryLoader, useClass: NSLazyModulesLoader_Generated }] })
                    ],
                    AppModule);
                    export { AppModule };`
            },
            {
                name: "should add NgModuleFactoryLoader at the end when the providers array is containing other providers",
                rawAppModule: `
                    import { NgModule } from "@angular/core";
                    import { NativeScriptModule } from "nativescript-angular/nativescript.module";
                    import { AppComponent } from "./app.component";
                    @NgModule({
                        bootstrap: [
                            AppComponent
                        ],
                        imports: [
                            NativeScriptModule
                        ],
                        declarations: [
                            AppComponent,
                        ],
                        providers: [MyCoolProvider]
                    })
                    export class AppModule { }
              `,
                transformedAppModule: `
                    import * as tslib_1 from "tslib"; import { NgModule } from "@angular/core";
                    import { NativeScriptModule } from "nativescript-angular/nativescript.module";
                    import { AppComponent } from "./app.component";
                    ${NgLazyLoaderCode}
                    let AppModule = class AppModule { };
                    AppModule = tslib_1.__decorate([ NgModule({
                        bootstrap: [ AppComponent ],
                        imports: [ NativeScriptModule ],
                        declarations: [ AppComponent, ],
                        providers: [MyCoolProvider, { provide: nsNgCoreImport_Generated.NgModuleFactoryLoader, useClass: NSLazyModulesLoader_Generated }] })
                    ],
                    AppModule);
                    export { AppModule };`
            },
            {
                name: "should NOT add NgModuleFactoryLoader when it's already defined",
                rawAppModule: `
                    import { NgModule } from "@angular/core";
                    import { NativeScriptModule } from "nativescript-angular/nativescript.module";
                    import { AppComponent } from "./app.component";

                    @NgModule({
                        bootstrap: [
                            AppComponent
                        ],
                        imports: [
                            NativeScriptModule
                        ],
                        declarations: [
                            AppComponent,
                        ],
                        providers: [{ provide: NgModuleFactoryLoader, useClass: CustomLoader }]
                    })
                    export class AppModule { }
              `,
                transformedAppModule: `
                    import * as tslib_1 from "tslib"; import { NgModule } from "@angular/core";
                    import { NativeScriptModule } from "nativescript-angular/nativescript.module";
                    import { AppComponent } from "./app.component";
                    let AppModule = class AppModule { };
                    AppModule = tslib_1.__decorate([ NgModule({
                        bootstrap: [ AppComponent ],
                        imports: [ NativeScriptModule ],
                        declarations: [ AppComponent, ],
                        providers: [{ provide: NgModuleFactoryLoader, useClass: CustomLoader }] })
                    ],
                    AppModule);
                    export { AppModule };`
            },
            {
                name: "should setup the object when an object is passed to the NgModule",
                rawAppModule: `
                    import { NgModule } from "@angular/core";
                    import { ${configObjectName} } from "somewhere";

                    @NgModule(${configObjectName})
                    export class AppModule { }
                `,
                transformedAppModule: `
                    import * as tslib_1 from "tslib";
                    import { NgModule } from "@angular/core";
                    import { ${configObjectName} } from "somewhere";

                    ${NgLazyLoaderCode}
                    ${configObjectSetupCode}
                    let AppModule = class AppModule { };
                    AppModule = tslib_1.__decorate([ NgModule(${configObjectName}) ], AppModule);

                    export { AppModule };
                `
            },
            {
                name: "should setup the object after its initialization when a local object is passed to the NgModule",
                rawAppModule: `
                    import { NgModule } from "@angular/core";
                    const ${configObjectName} = {
                        bootstrap: [
                            AppComponent
                        ],
                        declarations: [
                            AppComponent
                        ]
                    };

                    @NgModule(${configObjectName})
                    export class AppModule { }
                `,
                transformedAppModule: `
                    import * as tslib_1 from "tslib";
                    import { NgModule } from "@angular/core";
                    ${NgLazyLoaderCode}
                    const ${configObjectName} = {
                        bootstrap: [
                            AppComponent
                        ],
                        declarations: [
                            AppComponent
                        ]
                    };
                    ${configObjectSetupCode}
                    let AppModule = class AppModule { };
                    AppModule = tslib_1.__decorate([ NgModule(${configObjectName}) ], AppModule);
                    export { AppModule };
                `
            }
        ];
        testCases.forEach((testCase: any) => {
            it(`${testCase.name}`, async () => {
                const input = tags.stripIndent`${testCase.rawAppModule}`;
                const output = tags.stripIndent`${testCase.transformedAppModule}`;
                const { program, compilerHost } = createTypescriptContext(input);
                const projectDir = "/project/src/";
                const testFile = `${projectDir}test-file`;
                const ngCompiler = <AngularCompilerPlugin>{
                    typeChecker: program.getTypeChecker(),
                    entryModule: {
                        path: testFile,
                        className: "AppModule",
                    },
                };
                const transformer = nsReplaceLazyLoader(() => ngCompiler, testFile, projectDir);
                const result = transformTypescript(undefined, [transformer], program, compilerHost);

                expect(tags.oneLine`${result}`).toEqual(tags.oneLine`${output}`);
            });
        });
    });
});
