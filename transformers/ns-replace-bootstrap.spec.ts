import { tags } from '@angular-devkit/core';
import { createTypescriptContext, transformTypescript } from "@ngtools/webpack/src/transformers/spec_helpers";
import { nsReplaceBootstrap } from './ns-replace-bootstrap';
import { AngularCompilerPlugin } from '@ngtools/webpack';

describe('@ngtools/webpack transformers', () => {
  describe('replace_bootstrap', () => {
    it('should replace bootstrap', () => {
      const input = tags.stripIndent`
        import { platformNativeScriptDynamic } from "nativescript-angular/platform";
        import { AppModule } from "./app.module";

        platformNativeScriptDynamic().bootstrapModule(AppModule);
      `;

      const output = tags.stripIndent`
        import * as __NgCli_bootstrap_1_1 from "nativescript-angular/platform-static";
        import * as __NgCli_bootstrap_2_1 from "./app/app.module.ngfactory";

        __NgCli_bootstrap_1_1.platformNativeScript().bootstrapModuleFactory(__NgCli_bootstrap_2_1.AppModuleNgFactory);
      `;

      const { program, compilerHost } = createTypescriptContext(input);
      const projectDir = "/project/src/";
      const appModule = `${projectDir}app/app.module`;
      const ngCompiler = <AngularCompilerPlugin>{
        typeChecker: program.getTypeChecker(),
        entryModule: {
          path: appModule,
          className: 'AppModule',
        },
      };
      const transformer = nsReplaceBootstrap(() => ngCompiler, appModule, projectDir);
      const result = transformTypescript(undefined, [transformer], program, compilerHost);

      expect(tags.oneLine`${result}`).toEqual(tags.oneLine`${output}`);
    });

    it('should replace bootstrap and don`t use factories when Ivy is enabled', () => {
      const input = tags.stripIndent`
        import { platformNativeScriptDynamic } from "nativescript-angular/platform";
        import { AppModule } from "./app/app.module";

        platformNativeScriptDynamic().bootstrapModule(AppModule);
      `;

      const output = tags.stripIndent`
        import * as __NgCli_bootstrap_1_1 from "nativescript-angular/platform-static";
        import * as __NgCli_bootstrap_2_1 from "./app/app.module";

        __NgCli_bootstrap_1_1.platformNativeScript().bootstrapModule(__NgCli_bootstrap_2_1.AppModule);
      `;

      const { program, compilerHost } = createTypescriptContext(input);
      const projectDir = "/project/src/";
      const appModule = `${projectDir}app/app.module`;
      const ngCompiler: any = {
        _compilerOptions: {
          enableIvy: true
        },
        typeChecker: program.getTypeChecker(),
        entryModule: {
          path: appModule,
          className: 'AppModule',
        },
      };
      const transformer = nsReplaceBootstrap(() => ngCompiler, appModule, projectDir);
      const result = transformTypescript(undefined, [transformer], program, compilerHost);

      expect(tags.oneLine`${result}`).toEqual(tags.oneLine`${output}`);
    });

    it('should replace bootstrap when barrel files are used', () => {
      const input = tags.stripIndent`
        import { platformNativeScriptDynamic } from "nativescript-angular/platform";
        import { AppModule } from './app';

        platformNativeScriptDynamic().bootstrapModule(AppModule);
      `;

      const output = tags.stripIndent`
        import * as __NgCli_bootstrap_1_1 from "nativescript-angular/platform-static";
        import * as __NgCli_bootstrap_2_1 from "./app/app.module.ngfactory";

        __NgCli_bootstrap_1_1.platformNativeScript().bootstrapModuleFactory(__NgCli_bootstrap_2_1.AppModuleNgFactory);
      `;

      const { program, compilerHost } = createTypescriptContext(input);
      const projectDir = "/project/src/";
      const appModule = `${projectDir}app/app.module`;
      const ngCompiler = <AngularCompilerPlugin>{
        typeChecker: program.getTypeChecker(),
        entryModule: {
          path: appModule,
          className: 'AppModule',
        },
      };
      const transformer = nsReplaceBootstrap(() => ngCompiler, appModule, projectDir);
      const result = transformTypescript(undefined, [transformer], program, compilerHost);

      expect(tags.oneLine`${result}`).toEqual(tags.oneLine`${output}`);
    });

    it('should always import platform nativescript first', () => {
      const input = tags.stripIndent`
        import { platformNativeScriptDynamic } from "nativescript-angular/platform";
        import { AppModule } from "./app.module";
        import "./shared/kinvey.common";

        platformNativeScriptDynamic().bootstrapModule(AppModule);
      `;

      const output = tags.stripIndent`
        import * as __NgCli_bootstrap_1_1 from "nativescript-angular/platform-static";
        import * as __NgCli_bootstrap_2_1 from "./app/app.module.ngfactory";
        import "./shared/kinvey.common";

        __NgCli_bootstrap_1_1.platformNativeScript().bootstrapModuleFactory(__NgCli_bootstrap_2_1.AppModuleNgFactory);
      `;

      const { program, compilerHost } = createTypescriptContext(input);
      const projectDir = "/project/src/";
      const appModule = `${projectDir}app/app.module`;
      const ngCompiler = <AngularCompilerPlugin>{
        typeChecker: program.getTypeChecker(),
        entryModule: {
          path: appModule,
          className: 'AppModule',
        },
      };
      const transformer = nsReplaceBootstrap(() => ngCompiler, appModule, projectDir);
      const result = transformTypescript(undefined, [transformer], program, compilerHost);

      expect(tags.oneLine`${result}`).toEqual(tags.oneLine`${output}`);
    });
  });
});
