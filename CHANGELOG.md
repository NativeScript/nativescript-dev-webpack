<a name="0.18.5"></a>
## [0.18.5](https://github.com/NativeScript/nativescript-dev-webpack/compare/0.18.3...0.18.5) (2018-12-17)


### Bug Fixes

* **JS/TS:** use webpack resolver instead of Node.js resolver ([#681](https://github.com/NativeScript/nativescript-dev-webpack/issues/681)) ([9adc7e7](https://github.com/NativeScript/nativescript-dev-webpack/commit/9adc7e7))
* **Vue:** resolve full path for entry module ([#744](https://github.com/NativeScript/nativescript-dev-webpack/issues/744)) ([4d31ea0](https://github.com/NativeScript/nativescript-dev-webpack/commit/4d31ea0)), closes [#742](https://github.com/NativeScript/nativescript-dev-webpack/issues/742)


### Features

* **Vue:** add support for TypeScript ([#734](https://github.com/NativeScript/nativescript-dev-webpack/issues/734)) ([d290515](https://github.com/NativeScript/nativescript-dev-webpack/commit/d290515))



<a name="0.18.3"></a>
## [0.18.3](https://github.com/NativeScript/nativescript-dev-webpack/compare/0.18.2...0.18.3) (2018-12-10)


### Bug Fixes

* project's package.json indentation is not persisted ([#727](https://github.com/NativeScript/nativescript-dev-webpack/issues/727)) ([a45a45c](https://github.com/NativeScript/nativescript-dev-webpack/commit/a45a45c))



<a name="0.18.2"></a>
## [0.18.2](https://github.com/NativeScript/nativescript-dev-webpack/compare/0.18.1...0.18.2) (2018-12-06)


### Bug Fixes

* avoid getting `js` template in a `ts` project ([#717](https://github.com/NativeScript/nativescript-dev-webpack/issues/717)) ([c121c24](https://github.com/NativeScript/nativescript-dev-webpack/commit/c121c24))


### Features

* **HMR:** expose context ([#724](https://github.com/NativeScript/nativescript-dev-webpack/issues/724)) ([c14110c](https://github.com/NativeScript/nativescript-dev-webpack/commit/c14110c))



<a name="0.18.1"></a>
## [0.18.1](https://github.com/NativeScript/nativescript-dev-webpack/compare/0.18.0...0.18.1) (2018-12-03)


### Bug Fixes

* avoid getting `js` template in a `ts` project ([#717](https://github.com/NativeScript/nativescript-dev-webpack/issues/717)) ([c121c24](https://github.com/NativeScript/nativescript-dev-webpack/commit/c121c24))



<a name="0.18.0"></a>
# [0.18.0](https://github.com/NativeScript/nativescript-dev-webpack/compare/0.17.0...0.18.0) (2018-11-13)


### Bug Fixes

* globs usage in CopyWebpackPlugin ([#700](https://github.com/NativeScript/nativescript-dev-webpack/issues/700)) ([4782bf6](https://github.com/NativeScript/nativescript-dev-webpack/commit/4782bf6))


### Features
* Angular 7 support


<a name="0.17.0"></a>
# [0.17.0](https://github.com/NativeScript/nativescript-dev-webpack/compare/0.17.0-rc.1...0.17.0) (2018-10-31)

Version 0.17.0 introduces initial **Hot Module Replacement** support for plain JavaScript, TypeScript and Vue applications.

> Note: find out [here](https://github.com/NativeScript/nativescript-angular/wiki/HMR) how to enable HMR for Angular projects.

For more details, refer to [0.17.0-rc.1](https://github.com/NativeScript/nativescript-dev-webpack/blob/master/CHANGELOG.md#0170-rc1-2018-10-25) and [0.17.0-rc.0](https://github.com/NativeScript/nativescript-dev-webpack/blob/master/CHANGELOG.md#0170-rc0-2018-10-17) changelogs below.

<a name="0.17.0-rc.1"></a>
# [0.17.0-rc.1](https://github.com/NativeScript/nativescript-dev-webpack/compare/0.17.0-rc.0...0.17.0-rc.1) (2018-10-25)


### Bug Fixes

* update the version of `request` ([#694](https://github.com/NativeScript/nativescript-dev-webpack/issues/694)) ([39b858b](https://github.com/NativeScript/nativescript-dev-webpack/commit/39b858b))

<a name="0.16.3"></a>
# [0.16.3](https://github.com/NativeScript/nativescript-dev-webpack/compare/0.16.2...0.16.3) (2018-10-25)


### Bug Fixes

* update the version of `request` ([#694](https://github.com/NativeScript/nativescript-dev-webpack/issues/694)) ([39b858b](https://github.com/NativeScript/nativescript-dev-webpack/commit/39b858b))

<a name="0.17.0-rc.0"></a>
# [0.17.0-rc.0](https://github.com/NativeScript/nativescript-dev-webpack/compare/0.16.2...0.17.0-rc.0) (2018-10-17)


### Bug Fixes

* add a check for undefined environment values ([#673](https://github.com/NativeScript/nativescript-dev-webpack/issues/673)) ([c81484f](https://github.com/NativeScript/nativescript-dev-webpack/commit/c81484f))
* **uglify:** cache/parallel should be outside uglifyOptions ([#670](https://github.com/NativeScript/nativescript-dev-webpack/issues/670)) ([e15fec7](https://github.com/NativeScript/nativescript-dev-webpack/commit/e15fec7))
* attach to process's exit event on correct place ([#671](https://github.com/NativeScript/nativescript-dev-webpack/issues/671)) ([f4b40bf](https://github.com/NativeScript/nativescript-dev-webpack/commit/f4b40bf))


### Features

* add initial HMR support for plain JS/TS apps ([#645](https://github.com/NativeScript/nativescript-dev-webpack/issues/645)) ([a4ac32b](https://github.com/NativeScript/nativescript-dev-webpack/commit/a4ac32b))
* add hook for the preview command ([#649](https://github.com/NativeScript/nativescript-dev-webpack/issues/649)) ([b47da3c](https://github.com/NativeScript/nativescript-dev-webpack/commit/b47da3c))
* add Vue bundling support ([#676](https://github.com/NativeScript/nativescript-dev-webpack/issues/676)) ([8da8ccf](https://github.com/NativeScript/nativescript-dev-webpack/commit/8da8ccf))


<a name="0.16.2"></a>
## [0.16.2](https://github.com/NativeScript/nativescript-dev-webpack/compare/0.16.0...0.16.2) (2018-09-28)


### Bug Fixes

* update webpack dependencies ([#675](https://github.com/NativeScript/nativescript-dev-webpack/issues/675)) ([71cb30c](https://github.com/NativeScript/nativescript-dev-webpack/commit/71cb30c)), closes [#674](https://github.com/NativeScript/nativescript-dev-webpack/issues/674)


<a name="0.16.1"></a>
## [0.16.1](https://github.com/NativeScript/nativescript-dev-webpack/compare/0.16.0...0.16.1) (2018-09-17)


### Bug Fixes

* **angular:** AoT rebuild on template and style changes ([#659](https://github.com/NativeScript/nativescript-dev-webpack/issues/659)) ([d812d5d](https://github.com/NativeScript/nativescript-dev-webpack/commit/d812d5d)), closes [#641](https://github.com/NativeScript/nativescript-dev-webpack/issues/641)



<a name="0.16.0"></a>
# [0.16.0](https://github.com/NativeScript/nativescript-dev-webpack/compare/0.15.1...0.16.0) (2018-09-10)


### Features

* NativeScript bootstrap transformer ([#634](https://github.com/NativeScript/nativescript-dev-webpack/issues/634)) ([c016418](https://github.com/NativeScript/nativescript-dev-webpack/commit/c016418))



<a name="0.15.1"></a>
# [0.15.1](https://github.com/NativeScript/nativescript-dev-webpack/compare/0.15.0...0.15.1) (2018-08-07)


### Bug Fixes

* define process as undefined ([#619](https://github.com/NativeScript/nativescript-dev-webpack/issues/619)) ([845f426](https://github.com/NativeScript/nativescript-dev-webpack/commit/845f426))


<a name="0.15.0"></a>
# [0.15.0](https://github.com/NativeScript/nativescript-dev-webpack/compare/0.14.4...0.15.0) (2018-07-24)


### Bug Fixes

* **angular:** fix livesync for platform-specific files ([#615](https://github.com/NativeScript/nativescript-dev-webpack/issues/615)) ([93c5f77](https://github.com/NativeScript/nativescript-dev-webpack/commit/93c5f77)), closes [#611](https://github.com/NativeScript/nativescript-dev-webpack/issues/611) [#601](https://github.com/NativeScript/nativescript-dev-webpack/issues/601)
* array env args are serialized when sent to webpack ([#614](https://github.com/NativeScript/nativescript-dev-webpack/issues/614)) ([bfecb8c](https://github.com/NativeScript/nativescript-dev-webpack/commit/bfecb8c))


### Features

* **xml-namespace-loader:** add ignore option ([#605](https://github.com/NativeScript/nativescript-dev-webpack/issues/605)) ([b509bb3](https://github.com/NativeScript/nativescript-dev-webpack/commit/b509bb3)), closes [#558](https://github.com/NativeScript/nativescript-dev-webpack/issues/558)
* **debug**: generate source maps when running `tns debug --bundle` ([#617](https://github.com/NativeScript/nativescript-dev-webpack/pull/617))


<a name="0.14.3"></a>
## [0.14.3](https://github.com/NativeScript/nativescript-dev-webpack/compare/0.14.2...0.14.3) (2018-07-05)


### Bug Fixes

* Angular projects: the plugin will add `@ngtools/webpack` to the project deps only if `@angular-devkit/build-angular` is not a dependency. ([#594](https://github.com/NativeScript/nativescript-dev-webpack/issues/594)) ([7b15418](https://github.com/NativeScript/nativescript-dev-webpack/commit/7b15418)), closes [#595](https://github.com/NativeScript/nativescript-dev-webpack/issues/595)


### Migration

It's a good idea to remove `@angular-devkit/build-angular` from the
package.json and add `@ngtools/webpack` instead. This will speed up
the build.


<a name="0.14.2"></a>
## [0.14.2](https://github.com/NativeScript/nativescript-dev-webpack/compare/0.14.1...0.14.2) (2018-06-27)


### Bug Fixes

* resolve appComponents and xml namespaces absolute paths on Windows ([#578](https://github.com/NativeScript/nativescript-dev-webpack/issues/578)) ([14de7e1](https://github.com/NativeScript/nativescript-dev-webpack/commit/14de7e1))
* tell the {N} CLI to ignore the source dir when watching for changes ([#586](https://github.com/NativeScript/nativescript-dev-webpack/issues/586)) ([6b0f56b](https://github.com/NativeScript/nativescript-dev-webpack/commit/6b0f56b)), closes [#584](https://github.com/NativeScript/nativescript-dev-webpack/issues/584)


### Features

* add setting for plain modules regex ([#582](https://github.com/NativeScript/nativescript-dev-webpack/issues/582)) ([404abbb](https://github.com/NativeScript/nativescript-dev-webpack/commit/404abbb)), closes [#556](https://github.com/NativeScript/nativescript-dev-webpack/issues/556)



<a name="0.14.1"></a>
## [0.14.1](https://github.com/NativeScript/nativescript-dev-webpack/compare/0.14.0...0.14.1) (2018-06-22)


### Bug Fixes

* schema-utils peer dep warning for webpack 2/3 ([#577](https://github.com/NativeScript/nativescript-dev-webpack/issues/577)) ([afe569d](https://github.com/NativeScript/nativescript-dev-webpack/commit/afe569d))
* **AoT:** stop using require.context in Angular apps ([#574](https://github.com/NativeScript/nativescript-dev-webpack/issues/574)) ([23aaee9](https://github.com/NativeScript/nativescript-dev-webpack/commit/23aaee9)), closes [/github.com/angular/angular-cli/blob/master/packages/ngtools/webpack/src/compiler_host.ts#L235](https://github.com//github.com/angular/angular-cli/blob/master/packages/ngtools/webpack/src/compiler_host.ts/issues/L235) [#566](https://github.com/NativeScript/nativescript-dev-webpack/issues/566)


### Features

* add platform matching host for AngularCompilerPlugin ([#539](https://github.com/NativeScript/nativescript-dev-webpack/issues/539)) ([979f732](https://github.com/NativeScript/nativescript-dev-webpack/commit/979f732)), closes [#547](https://github.com/NativeScript/nativescript-dev-webpack/issues/547)
* make webpack deps production deps of the plugin ([#571](https://github.com/NativeScript/nativescript-dev-webpack/issues/571)) ([ba68a1b](https://github.com/NativeScript/nativescript-dev-webpack/commit/ba68a1b)), closes [#569](https://github.com/NativeScript/nativescript-dev-webpack/issues/569)


### BREAKING CHANGES

* The dependencies that were previously added by the nativescript-dev-webpack plugin to the project's package.json are now dependencies of the plugin itself.

MIGRATION:
1. Remove all obsolete dependencies from your project. You can do that by invoking the script:
```
./node_modules/.bin/update-ns-webpack --deps
```
2. [Angular] Add the following packages as devDependencies:
```
//package.json

"devDependencies": {
    "@angular-devkit/build-angular": "~0.7.0-rc.0",
    "@angular/compiler-cli": "~6.1.0-beta.1",
    //...
}
```



<a name="0.14.0"></a>
# [0.14.0](https://github.com/NativeScript/nativescript-dev-webpack/compare/0.13.0...0.14.0) (2018-06-22)


### Bug Fixes

* register UI modules in NG apps ([#570](https://github.com/NativeScript/nativescript-dev-webpack/issues/570)) ([c27e0db](https://github.com/NativeScript/nativescript-dev-webpack/commit/c27e0db))


### Features

* make webpack deps production deps of the plugin ([#571](https://github.com/NativeScript/nativescript-dev-webpack/issues/571)) ([ba68a1b](https://github.com/NativeScript/nativescript-dev-webpack/commit/ba68a1b)), closes [#569](https://github.com/NativeScript/nativescript-dev-webpack/issues/569)


### BREAKING CHANGES

* The dependencies that were previously added by the nativescript-dev-webpack plugin to the project's package.json are now dependencies of the plugin itself.

MIGRATION:
1. Remove all obsolete dependencies from your project. You can do that by invoking the script:
```
./node_modules/.bin/update-ns-webpack --deps
```
2. [Angular] Add the following packages as devDependencies:
```
//package.json

"devDependencies": {
    "@angular-devkit/build-angular": "~0.7.0-rc.0",
    "@angular/compiler-cli": "~6.1.0-beta.1",
    //...
}
```

If you see one of the following errors:
```
Error: Cannot find module '@ngtools/webpack'
Error: No module factory available for dependency type: ContextElementDependency
Error: Cannot find module '/Users/nsbuilduser/workspace/master-nativescript-sdk-examples-js-android/nativescript-sdk-examples-js/node_modules/webpack/bin/webpack.js
```

try running a clean npm install:
```
rm -rf node_modules package-lock.json
npm i
```



<a name="0.13.0"></a>
# [0.13.0](https://github.com/NativeScript/nativescript-dev-webpack/compare/0.12.0...0.13.0) (2018-06-13)


### Features

* add platform matching host for AngularCompilerPlugin ([#539](https://github.com/NativeScript/nativescript-dev-webpack/issues/539)) ([979f732](https://github.com/NativeScript/nativescript-dev-webpack/commit/979f732)), closes [#547](https://github.com/NativeScript/nativescript-dev-webpack/issues/547)


### Bug Fixes

* Webpack recompile fails when using AoT with watch mode ([#547](https://github.com/NativeScript/nativescript-dev-webpack/issues/547)) ([979f732](https://github.com/NativeScript/nativescript-dev-webpack/commit/979f732)), closes [#547](https://github.com/NativeScript/nativescript-dev-webpack/issues/547)



<a name="0.12.0"></a>
# [0.12.0](https://github.com/NativeScript/nativescript-dev-webpack/compare/0.11.0...0.12.0) (2018-05-30)

> You can follow the [Migration guide](https://www.nativescript.org/blog/upgrading-to-nativescript-webpack-0.12.0) for upgrading to this version.


### Bug Fixes

* allow using the plugin via symlink ([#501](https://github.com/NativeScript/nativescript-dev-webpack/issues/501)) ([a7acb4d](https://github.com/NativeScript/nativescript-dev-webpack/commit/a7acb4d))
* bundling of Angular apps using linked TS plugins ([#505](https://github.com/NativeScript/nativescript-dev-webpack/issues/505)) ([41779ad](https://github.com/NativeScript/nativescript-dev-webpack/commit/41779ad))
* bundling of ts apps using linked plugins ([#530](https://github.com/NativeScript/nativescript-dev-webpack/issues/530)) ([c7117d7](https://github.com/NativeScript/nativescript-dev-webpack/commit/c7117d7))
* register XML-only custom components ([#537](https://github.com/NativeScript/nativescript-dev-webpack/issues/537)) ([aaf4e88](https://github.com/NativeScript/nativescript-dev-webpack/commit/aaf4e88))


### Features

* add webpack 4 and Angular 6 support ([#495](https://github.com/NativeScript/nativescript-dev-webpack/issues/495)) ([eefce39](https://github.com/NativeScript/nativescript-dev-webpack/commit/eefce39))
* add xml loader for elements from external namespaces ([#525](https://github.com/NativeScript/nativescript-dev-webpack/issues/525)) ([19bbc7e](https://github.com/NativeScript/nativescript-dev-webpack/commit/19bbc7e))
* configure v8Version for snapshot tools ([#503](https://github.com/NativeScript/nativescript-dev-webpack/issues/503)) ([cf0d76b](https://github.com/NativeScript/nativescript-dev-webpack/commit/cf0d76b))
* generate the snapshot entry module at build time ([2ec8083](https://github.com/NativeScript/nativescript-dev-webpack/commit/2ec8083)), closes [#511](https://github.com/NativeScript/nativescript-dev-webpack/issues/511)
* load bundle config and app css at build time ([f9bbea9](https://github.com/NativeScript/nativescript-dev-webpack/commit/f9bbea9))
* move all node modules to the common chunk ([#507](https://github.com/NativeScript/nativescript-dev-webpack/issues/507)) ([2ff43bf](https://github.com/NativeScript/nativescript-dev-webpack/commit/2ff43bf))
* tweak the uglify configuration to enable compression for android ([7a125ee](https://github.com/NativeScript/nativescript-dev-webpack/commit/7a125ee))
* target es2015 modules when bundling using tsconfig.esm.json file. ([8922c96])(https://github.com/NativeScript/nativescript-dev-webpack/commit/8922c9611e756d165ec6ca454c237b6bcb56b8ef)


<a name="0.11.0"></a>
# [0.11.0](https://github.com/NativeScript/nativescript-dev-webpack/compare/0.10.2...0.11.0) (2018-04-25)


### Bug Fixes

* allow using the plugin via symlink ([#501](https://github.com/NativeScript/nativescript-dev-webpack/issues/501)) ([a7acb4d](https://github.com/NativeScript/nativescript-dev-webpack/commit/a7acb4d))
* bundling of Angular apps using linked TS plugins ([#505](https://github.com/NativeScript/nativescript-dev-webpack/issues/505)) ([41779ad](https://github.com/NativeScript/nativescript-dev-webpack/commit/41779ad))


### Features

* configure v8Version for snapshot tools ([#503](https://github.com/NativeScript/nativescript-dev-webpack/issues/503)) ([cf0d76b](https://github.com/NativeScript/nativescript-dev-webpack/commit/cf0d76b))

### BREAKING CHANGES

> The command below will overwrite the existing project's webpack configuration files with the most recent ones, so you don't have to manually apply the required changes:
> ```
> ./node_modules/.bin/update-ns-webpack --configs
> ```

* The NativeScriptAngularCompilerPlugin is loaded in a different way now. The existing projects using the plugin should add the following line to their `webpack.config.js` file:
``` js
// webpack.config.js

module.exports = env => {
    const platform = env && (env.android && "android" || env.ios && "ios");
    if (!platform) {
        throw new Error("You need to provide a target platform!");
    }

    const platforms = ["ios", "android"];
    const projectRoot = __dirname;
    nsWebpack.loadAdditionalPlugins({ projectDir: projectRoot }); // <----- Add this line

    // ...
``` 

* The `getAppPath` method expects two arguments now - `platform` and `projectRoot`. The usage inside the project's `webpack.config.js` should be changed in the following way:

Before:
``` js
// webpack.config.js

// Default destination inside platforms/<platform>/...
const dist = resolve(projectRoot, nsWebpack.getAppPath(platform));

// ...
```

After:
``` js
// webpack.config.js

// Default destination inside platforms/<platform>/...
const dist = resolve(projectRoot, nsWebpack.getAppPath(platform, projectRoot));

// ...
```



<a name="0.10.2"></a>
## [0.10.2](https://github.com/NativeScript/nativescript-dev-webpack/compare/0.10.1...0.10.2) (2018-04-18)


### Bug Fixes

* **hooks:** do not set INIT_CWD on any hook ([#494](https://github.com/NativeScript/nativescript-dev-webpack/issues/494)) ([afe6208](https://github.com/NativeScript/nativescript-dev-webpack/commit/afe6208))


<a name="0.10.1"></a>
## [0.10.1](https://github.com/NativeScript/nativescript-dev-webpack/compare/0.10.0...0.10.1) (2018-04-11)


### Bug Fixes

* **configs/angular:** use path relative to the appDir for the root ([8e7aa0c](https://github.com/NativeScript/nativescript-dev-webpack/commit/8e7aa0c))

<a name="0.10.0"></a>
# [0.10.0](https://github.com/NativeScript/nativescript-dev-webpack/compare/0.9.1...0.10.0) (2018-04-05)

> You need NativeScript 4.0 for using the new features from this version.

### Bug Fixes

* **hooks:** `after-watch` hook is not executed ([#483](https://github.com/NativeScript/nativescript-dev-webpack/issues/483)) ([a61cff4](https://github.com/NativeScript/nativescript-dev-webpack/commit/a61cff4))
* allow snapshot only in release ([#448](https://github.com/NativeScript/nativescript-dev-webpack/issues/448)) ([2dd9adc](https://github.com/NativeScript/nativescript-dev-webpack/commit/2dd9adc))
* clean snapshot artifacts on cleanApp hook ([#423](https://github.com/NativeScript/nativescript-dev-webpack/issues/423)) ([50c3ab9](https://github.com/NativeScript/nativescript-dev-webpack/commit/50c3ab9))
* remove progress indication ([#468](https://github.com/NativeScript/nativescript-dev-webpack/issues/468)) ([8961a93](https://github.com/NativeScript/nativescript-dev-webpack/commit/8961a93)), closes [/github.com/webpack/webpack/blob/4428efe48e1c5ff4cadb79e13f0fa48c12bdac35/lib/ProgressPlugin.js#L50](https://github.com//github.com/webpack/webpack/blob/4428efe48e1c5ff4cadb79e13f0fa48c12bdac35/lib/ProgressPlugin.js/issues/L50)
* remove unnecessary comma ([#472](https://github.com/NativeScript/nativescript-dev-webpack/issues/472)) ([ce60606](https://github.com/NativeScript/nativescript-dev-webpack/commit/ce60606))
* send arguments in watchPatterns hook ([#449](https://github.com/NativeScript/nativescript-dev-webpack/issues/449)) ([aa255bb](https://github.com/NativeScript/nativescript-dev-webpack/commit/aa255bb))
* Set INIT_CWD env in all before-* hooks ([#480](https://github.com/NativeScript/nativescript-dev-webpack/issues/480)) ([b7ef84f](https://github.com/NativeScript/nativescript-dev-webpack/commit/b7ef84f))
* **hooks:** Hooks not executed correctly when CLI is used as a library ([#479](https://github.com/NativeScript/nativescript-dev-webpack/issues/479)) ([87dd53d](https://github.com/NativeScript/nativescript-dev-webpack/commit/87dd53d))
* **prepare:** clean platforms/.../app/ when running webpack ([#465](https://github.com/NativeScript/nativescript-dev-webpack/issues/465)) ([cb2f51b](https://github.com/NativeScript/nativescript-dev-webpack/commit/cb2f51b))
* **snapshot:** use request module for http requests ([#428](https://github.com/NativeScript/nativescript-dev-webpack/issues/428)) ([01933e0](https://github.com/NativeScript/nativescript-dev-webpack/commit/01933e0)), closes [#389](https://github.com/NativeScript/nativescript-dev-webpack/issues/389)
* **uglify:** prevent SideDrawer transition class names from being renamed ([#426](https://github.com/NativeScript/nativescript-dev-webpack/issues/426)) ([0120329](https://github.com/NativeScript/nativescript-dev-webpack/commit/0120329)), closes [/github.com/telerik/nativescript-ui-feedback/issues/477#issuecomment-360772046](https://github.com//github.com/telerik/nativescript-ui-feedback/issues/477/issues/issuecomment-360772046) [#258](https://github.com/NativeScript/nativescript-dev-webpack/issues/258)


### Features

* **livesync:** enable webpack with watch ([#433](https://github.com/NativeScript/nativescript-dev-webpack/issues/433)) ([847a56f](https://github.com/NativeScript/nativescript-dev-webpack/commit/847a56f))
* consume shouldprepare hook ([#447](https://github.com/NativeScript/nativescript-dev-webpack/issues/447)) ([adb896c](https://github.com/NativeScript/nativescript-dev-webpack/commit/adb896c))


### BREAKING CHANGES

* The snapshot plugin is applied only when building for release.

Before:
```
tns run android --bundle --env.snapshot
```

After:
```
tns run android --bundle --env.snapshot --release --keyStorePath ~/path/to/keystore/my.keystore --keyStorePassword password --keyStoreAlias alias --keyStoreAliasPassword aliasPassword
```

<a name="0.9.2"></a>
## [0.9.2](https://github.com/NativeScript/nativescript-dev-webpack/compare/0.9.1...0.9.2) (2018-02-15)


### Bug Fixes

* clean snapshot artifacts on cleanApp hook ([#423](https://github.com/NativeScript/nativescript-dev-webpack/issues/423)) ([50c3ab9](https://github.com/NativeScript/nativescript-dev-webpack/commit/50c3ab9))
* **snapshot:** use request module for http requests ([#428](https://github.com/NativeScript/nativescript-dev-webpack/issues/428)) ([01933e0](https://github.com/NativeScript/nativescript-dev-webpack/commit/01933e0)), closes [#389](https://github.com/NativeScript/nativescript-dev-webpack/issues/389)
* **uglify:** prevent SideDrawer transition class names from being renamed ([#426](https://github.com/NativeScript/nativescript-dev-webpack/issues/426)) ([0120329](https://github.com/NativeScript/nativescript-dev-webpack/commit/0120329)), closes [#258](https://github.com/NativeScript/nativescript-dev-webpack/issues/258)



<a name="0.9.1"></a>
## [0.9.1](https://github.com/NativeScript/nativescript-dev-webpack/compare/0.9.0...0.9.1) (2018-01-10)


### Bug Fixes

* respect windows paths in /app.css regex ([#385](https://github.com/NativeScript/nativescript-dev-webpack/issues/385)) ([a37cca0](https://github.com/NativeScript/nativescript-dev-webpack/commit/a37cca0))
* support aot on windows ([#392](https://github.com/NativeScript/nativescript-dev-webpack/issues/392)) ([8a20502](https://github.com/NativeScript/nativescript-dev-webpack/commit/8a20502))
* **css:** disable minification when using uglify ([#383](https://github.com/NativeScript/nativescript-dev-webpack/issues/383)) ([8e1a5a6](https://github.com/NativeScript/nativescript-dev-webpack/commit/8e1a5a6)), closes [#377](https://github.com/NativeScript/nativescript-dev-webpack/issues/377)


### Features

* support for Angular 5.1 ([#374](https://github.com/NativeScript/nativescript-dev-webpack/issues/374)) ([5a40330](https://github.com/NativeScript/nativescript-dev-webpack/commit/5a40330))
* use UglifyJsPlugin which support es6 code ([#401](https://github.com/NativeScript/nativescript-dev-webpack/issues/401)) ([34b1b9d](https://github.com/NativeScript/nativescript-dev-webpack/commit/34b1b9d))



<a name="0.9.0"></a>
# [0.9.0](https://github.com/NativeScript/nativescript-dev-webpack/compare/0.8.0...v0.9.0) (2017-12-20)

> You can follow the [Migration guide](https://www.nativescript.org/blog/nativescript-webpack-0.9.0-what-changed-and-how-to-upgrade) for upgrading to this version.


### Bug Fixes

* **compiler:** reject promise with real error ([#350](https://github.com/NativeScript/nativescript-dev-webpack/issues/350)) ([0b9febe](https://github.com/NativeScript/nativescript-dev-webpack/commit/0b9febe))
* **configs:** don't follow symlinks for loaders ([#287](https://github.com/NativeScript/nativescript-dev-webpack/issues/287)) ([7deb117](https://github.com/NativeScript/nativescript-dev-webpack/commit/7deb117))
* **ns-bundle:** support for Node.js 9 ([#321](https://github.com/NativeScript/nativescript-dev-webpack/issues/321)) ([b4800c8](https://github.com/NativeScript/nativescript-dev-webpack/commit/b4800c8))
* **postinstall:** stop removing "start/run-platform-bundle" scripts ([#301](https://github.com/NativeScript/nativescript-dev-webpack/issues/301)) ([ddecb56](https://github.com/NativeScript/nativescript-dev-webpack/commit/ddecb56))
* **snapshot:** interrupt the webpack build on error ([#369](https://github.com/NativeScript/nativescript-dev-webpack/issues/369)) ([0a6d1b9](https://github.com/NativeScript/nativescript-dev-webpack/commit/0a6d1b9))
* **snapshot:** use autoclose option on writestream ([#345](https://github.com/NativeScript/nativescript-dev-webpack/issues/345)) ([3967d79](https://github.com/NativeScript/nativescript-dev-webpack/commit/3967d79))
* **update-ns-webpack:** make it possible to call as executable ([#347](https://github.com/NativeScript/nativescript-dev-webpack/issues/347)) ([9fa7656](https://github.com/NativeScript/nativescript-dev-webpack/commit/9fa7656))


### Features

* Angular 5 support ([#328](https://github.com/NativeScript/nativescript-dev-webpack/issues/328)) ([5539ddb](https://github.com/NativeScript/nativescript-dev-webpack/commit/5539ddb))
* add FS, PlatformSuffixPlugin and css2json-loader ([#290](https://github.com/NativeScript/nativescript-dev-webpack/issues/290)) ([ea29bb6](https://github.com/NativeScript/nativescript-dev-webpack/commit/ea29bb6))
* Configure the vendor scripts to also use less, sass, scss for app.css ([#343](https://github.com/NativeScript/nativescript-dev-webpack/issues/343)) ([273dbd5](https://github.com/NativeScript/nativescript-dev-webpack/commit/273dbd5))
* enable plugin to run through {N} CLI hooks ([#299](https://github.com/NativeScript/nativescript-dev-webpack/issues/299)) ([9a57a53](https://github.com/NativeScript/nativescript-dev-webpack/commit/9a57a53))
* **sass:** add conditional sass deps for webpack ([#355](https://github.com/NativeScript/nativescript-dev-webpack/issues/355)) ([f51241c](https://github.com/NativeScript/nativescript-dev-webpack/commit/f51241c))



<a name="0.8.0"></a>
# [0.8.0](https://github.com/NativeScript/nativescript-dev-webpack/compare/0.7.3...0.8.0) (2017-09-08)

### Features

* add support for web workers to default template ([#269](https://github.com/NativeScript/nativescript-dev-webpack/issues/269)) ([494ccbb](https://github.com/NativeScript/nativescript-dev-webpack/commit/494ccbb))


<a name="0.7.3"></a>
## [0.7.3](https://github.com/NativeScript/nativescript-dev-webpack/compare/0.7.2...0.7.3) (2017-07-12)


### Bug Fixes

* **ns-bundle:** remove command escaping when spawning child process ([#218](https://github.com/NativeScript/nativescript-dev-webpack/issues/218)) ([28e3aad](https://github.com/NativeScript/nativescript-dev-webpack/commit/28e3aad)), closes [#214](https://github.com/NativeScript/nativescript-dev-webpack/issues/214)


<a name="0.7.2"></a>
## [0.7.2](https://github.com/NativeScript/nativescript-dev-webpack/compare/0.7.1...0.7.2) (2017-07-05)


### Bug Fixes

* **mangle-excludes:** add Compat Query and Close listener classes ([#190](https://github.com/NativeScript/nativescript-dev-webpack/issues/190)) ([5791cfc](https://github.com/NativeScript/nativescript-dev-webpack/commit/5791cfc))
* **ns-bundle:** escape command and args when spawning child process ([c3e7376](https://github.com/NativeScript/nativescript-dev-webpack/commit/c3e7376)), closes [#209](https://github.com/NativeScript/nativescript-dev-webpack/issues/209)
* run gradlew clean only for tns <=3.0.1 ([efea463](https://github.com/NativeScript/nativescript-dev-webpack/commit/efea463))


### Features

* add support for passing params via --env to webpack ([#204](https://github.com/NativeScript/nativescript-dev-webpack/issues/204)) ([4921321](https://github.com/NativeScript/nativescript-dev-webpack/commit/4921321))
* alias tilde to point to the app root ([#201](https://github.com/NativeScript/nativescript-dev-webpack/issues/201)) ([3fb865d](https://github.com/NativeScript/nativescript-dev-webpack/commit/3fb865d))
* add BundleAnalyzerPlugin to webpack config ([ac32b14](https://github.com/NativeScript/nativescript-dev-webpack/commit/ac32b14))



<a name="0.7.1"></a>
## [0.7.1](https://github.com/NativeScript/nativescript-dev-webpack/compare/0.6.3...0.7.1) (2017-06-22)


### Bug Fixes

* **mangle-excludes:** add Compat Query and Close listener classes ([#190](https://github.com/NativeScript/nativescript-dev-webpack/issues/190)) ([5791cfc](https://github.com/NativeScript/nativescript-dev-webpack/commit/5791cfc))


### Features

* introduce support for v8 heap snapshot generation ([1b5dcdc](https://github.com/NativeScript/nativescript-dev-webpack/commit/1b5dcdc))
* add BundleAnalyzerPlugin to webpack config ([ac32b14](https://github.com/NativeScript/nativescript-dev-webpack/commit/ac32b14))



<a name="0.6.3"></a>
## [0.6.3](https://github.com/NativeScript/nativescript-dev-webpack/compare/0.6.2...0.6.3) (2017-06-09)


### Bug Fixes

* **npm scripts:** replace deprecated build-app script on postinstall ([#184](https://github.com/NativeScript/nativescript-dev-webpack/issues/184)) ([a4e7f1c](https://github.com/NativeScript/nativescript-dev-webpack/commit/a4e7f1c)), closes [#183](https://github.com/NativeScript/nativescript-dev-webpack/issues/183)



<a name="0.6.2"></a>
## [0.6.2](https://github.com/NativeScript/nativescript-dev-webpack/compare/0.6.1...0.6.2) (2017-06-06)


### Bug Fixes

* **ns-bundle:** properly get tns command ([#170](https://github.com/NativeScript/nativescript-dev-webpack/issues/170)) ([43eeaf4](https://github.com/NativeScript/nativescript-dev-webpack/commit/43eeaf4)), closes [#169](https://github.com/NativeScript/nativescript-dev-webpack/issues/169)
* bundle scripts should invoke tns run instead of tns start ([#174](https://github.com/NativeScript/nativescript-dev-webpack/issues/174)) ([f3d8a3a](https://github.com/NativeScript/nativescript-dev-webpack/commit/f3d8a3a)), closes [#172](https://github.com/NativeScript/nativescript-dev-webpack/issues/172)
* clean android build artifacts when using with uglify ([#175](https://github.com/NativeScript/nativescript-dev-webpack/issues/175)) ([278244b](https://github.com/NativeScript/nativescript-dev-webpack/commit/278244b))
* exclude impl core modules classes from mangling ([#173](https://github.com/NativeScript/nativescript-dev-webpack/issues/173)) ([53d7538](https://github.com/NativeScript/nativescript-dev-webpack/commit/53d7538))



<a name="0.6.1"></a>
## [0.6.1](https://github.com/NativeScript/nativescript-dev-webpack/compare/0.6.0...0.6.1) (2017-05-31)


### Bug Fixes

* **ns-bundle:** add missing return ([#167](https://github.com/NativeScript/nativescript-dev-webpack/issues/167)) ([cd7ea25](https://github.com/NativeScript/nativescript-dev-webpack/commit/cd7ea25))
* **ns-bundle:** parse all '*-app' flags as tns commands ([#166](https://github.com/NativeScript/nativescript-dev-webpack/issues/166)) ([8e7a1b3](https://github.com/NativeScript/nativescript-dev-webpack/commit/8e7a1b3))


### Features

* add publish-ios-bundle npm script ([c424a8a](https://github.com/NativeScript/nativescript-dev-webpack/commit/c424a8a))



<a name="0.6.0"></a>
# [0.6.0](https://github.com/NativeScript/nativescript-dev-webpack/compare/0.5.0...0.6.0) (2017-05-29)


### Bug Fixes

* **ns-bundle:** clean android build for NativeScript CLI 3.0.1<= ([#163](https://github.com/NativeScript/nativescript-dev-webpack/issues/163)) ([35ce787](https://github.com/NativeScript/nativescript-dev-webpack/commit/35ce787))
* **template:** disable minification of css by css-loader ([#154](https://github.com/NativeScript/nativescript-dev-webpack/issues/154)) ([30e9c97](https://github.com/NativeScript/nativescript-dev-webpack/commit/30e9c97)), closes [#135](https://github.com/NativeScript/nativescript-dev-webpack/issues/135)


### Features

* add UrlResolvePlugin for platform-specific template/style urls ([#155](https://github.com/NativeScript/nativescript-dev-webpack/issues/155)) ([2ccf55b](https://github.com/NativeScript/nativescript-dev-webpack/commit/2ccf55b)), closes [#75](https://github.com/NativeScript/nativescript-dev-webpack/issues/75)

### BREAKING CHANGES:
The StyleUrlResolvePlugin is now replaced by the UrlResolvePlugin. The latter replaces both style and template platform-specific urls from Angular components. On postinstall nativescript-dev-webpack will automatically replaces all occurencies of the old plugin in the project's webpack config.


<a name="0.5.0"></a>
# [0.5.0](https://github.com/NativeScript/nativescript-dev-webpack/compare/0.4.2...0.5.0) (2017-05-11)


### Bug Fixes

* **ns-bundle:** don't re-add scripts from nativescript-dev-webpack ([3d690cb](https://github.com/NativeScript/nativescript-dev-webpack/commit/3d690cb))
* **ns-bundle:** pass platform and uglify as env properties ([dcf21f8](https://github.com/NativeScript/nativescript-dev-webpack/commit/dcf21f8))
* **ns-bundle:** use webpack.config.js instead of webpack.common.js ([3df5d9b](https://github.com/NativeScript/nativescript-dev-webpack/commit/3df5d9b))
* **template:** create empty `tns-java-classes.js` internally ([#148](https://github.com/NativeScript/nativescript-dev-webpack/issues/148)) ([0fd9159](https://github.com/NativeScript/nativescript-dev-webpack/commit/0fd9159))
* **templates:** prefer css templates over platform.css templates ([6fc4747](https://github.com/NativeScript/nativescript-dev-webpack/commit/6fc4747))

### BREAKING CHANGES:
The plugin now adds `webpack.config.js` file instead of `webpack.common.js`, `webpack.android.js` and `webpack.ios.js` files.
The ns-bundle script targets the `webpack.config.js` file in
your repository instead of the `webpack.common.js` one. If you modified
your configuration, you need to apply the changes to `webpack.config.js`.
The following files are no longer needed and can be safely removed from
the project: `webpack.common.js`, `webpack.android.js`,
`webpack.ios.js`.


<a name="0.4.2"></a>
## [0.4.2](https://github.com/NativeScript/nativescript-dev-webpack/compare/0.4.1...0.4.2) (2017-05-04)


### Bug Fixes

* **ns-bundle:** respect platform version from app package.json ([#138](https://github.com/NativeScript/nativescript-dev-webpack/issues/138)) ([839ce93](https://github.com/NativeScript/nativescript-dev-webpack/commit/839ce93))
* **tsconfig:** add missing paths and skipLibCheck option ([#140](https://github.com/NativeScript/nativescript-dev-webpack/issues/140)) ([c453944](https://github.com/NativeScript/nativescript-dev-webpack/commit/c453944))



<a name="0.4.1"></a>
## [0.4.1](https://github.com/NativeScript/nativescript-dev-webpack/compare/v0.4.0...0.4.1) (2017-05-01)


### Bug Fixes

* **ns-bundle:** escape arguments passed to `tns` command ([#125](https://github.com/NativeScript/nativescript-dev-webpack/issues/125)) ([b9430e3](https://github.com/NativeScript/nativescript-dev-webpack/commit/b9430e3)), closes [#123](https://github.com/NativeScript/nativescript-dev-webpack/issues/123)
* **template:** include platform specific files in bundle first ([#133](https://github.com/NativeScript/nativescript-dev-webpack/issues/133)) ([c399e1e](https://github.com/NativeScript/nativescript-dev-webpack/commit/c399e1e)), closes [#31](https://github.com/NativeScript/nativescript-dev-webpack/issues/31)
* **template:** ship android bundle with empty `tns-java-classes.js` chunk ([#128](https://github.com/NativeScript/nativescript-dev-webpack/issues/128)) ([b65a80c](https://github.com/NativeScript/nativescript-dev-webpack/commit/b65a80c))


### Features

* **ns-bundle:** app can be just prepared and bundled now ([#126](https://github.com/NativeScript/nativescript-dev-webpack/issues/126)) ([b0688b4](https://github.com/NativeScript/nativescript-dev-webpack/commit/b0688b4))



<a name="0.4.0"></a>
# [0.4.0](https://github.com/NativeScript/nativescript-dev-webpack/compare/v0.3.7...v0.4.0) (2017-04-20)


### Bug Fixes

* add webpack.common template for JS projects ([7451545](https://github.com/NativeScript/nativescript-dev-webpack/commit/7451545)), closes [#113](https://github.com/NativeScript/nativescript-dev-webpack/issues/113)
* **installer:** show helper message for new dependencies ([#122](https://github.com/NativeScript/nativescript-dev-webpack/issues/122)) ([5c7ebeb](https://github.com/NativeScript/nativescript-dev-webpack/commit/5c7ebeb))
* **ns-bundle:** use remove/add platform instead of clean-app ([#116](https://github.com/NativeScript/nativescript-dev-webpack/issues/116)) ([6609370](https://github.com/NativeScript/nativescript-dev-webpack/commit/6609370))
* **tsconfig:** add "exclude" property to aot config ([#120](https://github.com/NativeScript/nativescript-dev-webpack/issues/120)) ([d28dba1](https://github.com/NativeScript/nativescript-dev-webpack/commit/d28dba1)), closes [#101](https://github.com/NativeScript/nativescript-dev-webpack/issues/101)


### Features

* detect required devDeps versions ([9b102c3](https://github.com/NativeScript/nativescript-dev-webpack/commit/9b102c3))



<a name="0.3.7"></a>
## [0.3.7](https://github.com/NativeScript/nativescript-dev-webpack/compare/v0.3.6...v0.3.7) (2017-03-31)


### Bug Fixes

* **uglify:** exclude tns 3.0 listener impls from mangling ([#102](https://github.com/NativeScript/nativescript-dev-webpack/issues/102)) ([6666191](https://github.com/NativeScript/nativescript-dev-webpack/commit/6666191))


### Features

* update to Angular 4.0 and pin @ngtools/webpack version ([#107](https://github.com/NativeScript/nativescript-dev-webpack/issues/107)) ([247e507](https://github.com/NativeScript/nativescript-dev-webpack/commit/247e507))



<a name="0.3.6"></a>
## [0.3.6](https://github.com/NativeScript/nativescript-dev-webpack/compare/v0.3.5...v0.3.6) (2017-03-08)


### Bug Fixes

* **plugins:** add additional check for node.text in StyleUrlResolvePlugin ([#95](https://github.com/NativeScript/nativescript-dev-webpack/issues/95)) ([4a1b625](https://github.com/NativeScript/nativescript-dev-webpack/commit/4a1b625)), closes [#92](https://github.com/NativeScript/nativescript-dev-webpack/issues/92)



<a name="0.3.5"></a>
## [0.3.5](https://github.com/NativeScript/nativescript-dev-webpack/compare/v0.3.4...v0.3.5) (2017-02-28)


### Bug Fixes

* **plugins:** check for argument properties before traversing ([#83](https://github.com/NativeScript/nativescript-dev-webpack/issues/83)) ([bc2c6ec](https://github.com/NativeScript/nativescript-dev-webpack/commit/bc2c6ec))
* **scripts:** correctly execute ns-bundle for windows ([#89](https://github.com/NativeScript/nativescript-dev-webpack/issues/89)) ([ad965ed](https://github.com/NativeScript/nativescript-dev-webpack/commit/ad965ed))
* **templates:** Disable node "fs" shim ([#82](https://github.com/NativeScript/nativescript-dev-webpack/issues/82)) ([b86e1ae](https://github.com/NativeScript/nativescript-dev-webpack/commit/b86e1ae)), closes [#80](https://github.com/NativeScript/nativescript-dev-webpack/issues/80)


### Features

* **deps:** update to @ngtools/webpack v1.2.10 ([#84](https://github.com/NativeScript/nativescript-dev-webpack/issues/84)) ([70e60a6](https://github.com/NativeScript/nativescript-dev-webpack/commit/70e60a6))



<a name="0.3.4"></a>
## [0.3.4](https://github.com/NativeScript/nativescript-dev-webpack/compare/v0.3.3...v0.3.4) (2017-02-16)


### Bug Fixes

* run `tns-xml-loader` before `@ngtools` loader ([#66](https://github.com/NativeScript/nativescript-dev-webpack/issues/66)) ([325cb90](https://github.com/NativeScript/nativescript-dev-webpack/commit/325cb90)), closes [#64](https://github.com/NativeScript/nativescript-dev-webpack/issues/64)
* **scripts:** respect tns build/run args passed to ns-bundle ([#71](https://github.com/NativeScript/nativescript-dev-webpack/issues/71)) ([17b9d82](https://github.com/NativeScript/nativescript-dev-webpack/commit/17b9d82))
* **uglify:** exclude tns 3.0 listeners from mangling ([#72](https://github.com/NativeScript/nativescript-dev-webpack/issues/72)) ([b9d6a3f](https://github.com/NativeScript/nativescript-dev-webpack/commit/b9d6a3f))


### Features

* **scripts:** add ns-bundle and verify-bundle ([#69](https://github.com/NativeScript/nativescript-dev-webpack/issues/69)) ([e80cbdc](https://github.com/NativeScript/nativescript-dev-webpack/commit/e80cbdc))



<a name="0.3.3"></a>
## [0.3.3](https://github.com/NativeScript/nativescript-dev-webpack/compare/v0.3.2...v0.3.3) (2017-02-01)


### Bug Fixes

* exclude from mangling EditableTextBase ([#60](https://github.com/NativeScript/nativescript-dev-webpack/issues/60)) ([226f354](https://github.com/NativeScript/nativescript-dev-webpack/commit/226f354))
* register elements from embedded templates ([#56](https://github.com/NativeScript/nativescript-dev-webpack/issues/56)) ([05f33ed](https://github.com/NativeScript/nativescript-dev-webpack/commit/05f33ed)), closes [#55](https://github.com/NativeScript/nativescript-dev-webpack/issues/55)
* **uglify:** Exclude layout classes from mangling. ([75bdeb1](https://github.com/NativeScript/nativescript-dev-webpack/commit/75bdeb1))


### Features

* **deps:** add support for webpack 2.2+ ([5c00f2d](https://github.com/NativeScript/nativescript-dev-webpack/commit/5c00f2d))



<a name="0.3.2"></a>
## [0.3.2](https://github.com/NativeScript/nativescript-dev-webpack/compare/v0.3.1...v0.3.2) (2017-01-16)


### Features

* add support for tsc[@2](https://github.com/2).1 and ng[@2](https://github.com/2).4.2 ([e320b8b](https://github.com/NativeScript/nativescript-dev-webpack/commit/e320b8b))



<a name="0.3.1"></a>
## [0.3.1](https://github.com/NativeScript/nativescript-dev-webpack/compare/71d7823...v0.3.1) (2017-01-11)


### Bug Fixes

* add typescript@~2.0.10 to ng projects ([#48](https://github.com/NativeScript/nativescript-dev-webpack/issues/48)) ([87741a1](https://github.com/NativeScript/nativescript-dev-webpack/commit/87741a1))
* use AoT entry module if it exists ([b8c4f1c](https://github.com/NativeScript/nativescript-dev-webpack/commit/b8c4f1c))


### Features

* add plugin to support android/ios styleUrls ([#47](https://github.com/NativeScript/nativescript-dev-webpack/issues/47)) ([be12c23](https://github.com/NativeScript/nativescript-dev-webpack/commit/be12c23)), closes [#36](https://github.com/NativeScript/nativescript-dev-webpack/issues/36)
* support @ngtools/webpack-1.2.1 ([71d7823](https://github.com/NativeScript/nativescript-dev-webpack/commit/71d7823))
* use the nativescript fork of css-loader ([3b6a1c8](https://github.com/NativeScript/nativescript-dev-webpack/commit/3b6a1c8))


