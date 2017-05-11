<a name="0.5.0"></a>
# [0.5.0](https://github.com/NativeScript/nativescript-dev-webpack/compare/0.4.2...0.5.0) (2017-05-11)


### Bug Fixes

* **ns-bundle:** don't re-add scripts from nativescript-dev-webpack ([3d690cb](https://github.com/NativeScript/nativescript-dev-webpack/commit/3d690cb))
* **ns-bundle:** pass platform and uglify as env properties ([dcf21f8](https://github.com/NativeScript/nativescript-dev-webpack/commit/dcf21f8))
* **ns-bundle:** use webpack.config.js instead of webpack.common.js ([3df5d9b](https://github.com/NativeScript/nativescript-dev-webpack/commit/3df5d9b))
* **template:** create empty `tns-java-classes.js` internally ([#148](https://github.com/NativeScript/nativescript-dev-webpack/issues/148)) ([0fd9159](https://github.com/NativeScript/nativescript-dev-webpack/commit/0fd9159))
* **templates:** prefer css templates over platform.css templates ([6fc4747](https://github.com/NativeScript/nativescript-dev-webpack/commit/6fc4747))

BREAKING CHANGES:
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



