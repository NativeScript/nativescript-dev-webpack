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



