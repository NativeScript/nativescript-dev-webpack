import * as proxyquire from 'proxyquire';
import * as nsWebpackIndex from '../index';
import { join } from 'path';
import { skipPartiallyEmittedExpressions } from 'typescript';
// With noCallThru enabled, `proxyquire` will not fall back to requiring the real module to populate properties that are not mocked.
// This allows us to mock packages that are not available in node_modules.
// In case you want to enable fallback for a specific object, just add `'@noCallThru': false`.
proxyquire.noCallThru();

class EmptyClass { };

let angularCompilerOptions: any;
class AngularCompilerStub {
    constructor(options) {
        angularCompilerOptions = options;
    }
};

let uglifyJsOptions: any;
class UglifyJsStub {
    constructor(options) {
        uglifyJsOptions = options;
    }
};

const nativeScriptDevWebpack = {
    GenerateBundleStarterPlugin: EmptyClass,
    WatchStateLoggerPlugin: EmptyClass,
    PlatformFSPlugin: EmptyClass,
    getAppPath: () => 'app',
    getEntryModule: () => 'EntryModule',
    getResolver: () => null,
    getEntryPathRegExp: () => null,
    getConvertedExternals: nsWebpackIndex.getConvertedExternals,
    getSourceMapFilename: nsWebpackIndex.getSourceMapFilename
};

const emptyObject = {};
const FakeAotTransformerFlag = "aot";
const FakeHmrTransformerFlag = "hmr";
const FakeLazyTransformerFlag = "lazy";
const webpackConfigAngular = proxyquire('./webpack.angular', {
    'nativescript-dev-webpack': nativeScriptDevWebpack,
    'nativescript-dev-webpack/nativescript-target': emptyObject,
    'nativescript-dev-webpack/transformers/ns-replace-bootstrap': { nsReplaceBootstrap: () => { return FakeAotTransformerFlag } },
    'nativescript-dev-webpack/transformers/ns-replace-lazy-loader': { nsReplaceLazyLoader: () => { return FakeLazyTransformerFlag } },
    'nativescript-dev-webpack/transformers/ns-support-hmr-ng': { nsSupportHmrNg: () => { return FakeHmrTransformerFlag } },
    'nativescript-dev-webpack/utils/ast-utils': { getMainModulePath: () => { return "fakePath"; } },
    'nativescript-dev-webpack/plugins/NativeScriptAngularCompilerPlugin': { getAngularCompilerPlugin: () => { return AngularCompilerStub; } },
    '@ngtools/webpack': {
        AngularCompilerPlugin: AngularCompilerStub
    },
    'uglifyjs-webpack-plugin': UglifyJsStub
});

const webpackConfigTypeScript = proxyquire('./webpack.typescript', {
    'nativescript-dev-webpack': nativeScriptDevWebpack,
    'nativescript-dev-webpack/nativescript-target': emptyObject,
    'uglifyjs-webpack-plugin': UglifyJsStub
});

const webpackConfigJavaScript = proxyquire('./webpack.javascript', {
    'nativescript-dev-webpack': nativeScriptDevWebpack,
    'nativescript-dev-webpack/nativescript-target': emptyObject,
    'uglifyjs-webpack-plugin': UglifyJsStub
});

const webpackConfigVue = proxyquire('./webpack.vue', {
    'nativescript-dev-webpack': nativeScriptDevWebpack,
    'nativescript-dev-webpack/nativescript-target': emptyObject,
    'vue-loader/lib/plugin': EmptyClass,
    'nativescript-vue-template-compiler': emptyObject,
    'uglifyjs-webpack-plugin': UglifyJsStub
});

describe('webpack.config.js', () => {
    const getInput = (options: { platform: string, aot?: boolean, hmr?: boolean, externals?: string[], sourceMap?: boolean, hiddenSourceMap?: boolean | string }) => {
        const input: any = Object.assign({}, options);;
        input[options.platform] = true;
        return input;
    };

    [
        { type: 'javascript', webpackConfig: webpackConfigJavaScript },
        { type: 'typescript', webpackConfig: webpackConfigTypeScript },
        { type: 'angular', webpackConfig: webpackConfigAngular },
        { type: 'vue', webpackConfig: webpackConfigVue }
    ].forEach(element => {
        const { type, webpackConfig } = element;
        [
            'android',
            'ios'
        ].forEach(platform => {
            describe(`verify externals for webpack.${type}.js (${platform})`, () => {
                afterEach(() => {
                    nativeScriptDevWebpack.getConvertedExternals = nsWebpackIndex.getConvertedExternals;
                });

                it('returns empty array when externals are not passed', () => {
                    const input = getInput({ platform });
                    const config = webpackConfig(input);
                    expect(config.externals).toEqual([]);
                });

                it('calls getConvertedExternals to convert externals', () => {
                    let isCalled = false;
                    nativeScriptDevWebpack.getConvertedExternals = () => {
                        isCalled = true;
                        return [];
                    };

                    const input = getInput({ platform, externals: ['nativescript-vue'] });
                    webpackConfig(input);
                    expect(isCalled).toBe(true, 'Webpack.config.js must use the getConvertedExternals method');
                });

                [
                    {
                        input: ['nativescript-vue'],
                        expectedOutput: [/^nativescript-vue((\/.*)|$)/]
                    },
                    {
                        input: ['nativescript-vue', 'nativescript-angular'],
                        expectedOutput: [/^nativescript-vue((\/.*)|$)/, /^nativescript-angular((\/.*)|$)/]
                    },
                ].forEach(testCase => {
                    const input = getInput({ platform, externals: testCase.input });

                    it(`are correct regular expressions, for input ${testCase.input}`, () => {
                        const config = webpackConfig(input);
                        expect(config.externals).toEqual(testCase.expectedOutput);
                    });
                });
            });


            if (type === 'angular') {
                describe(`angular transformers for webpack.${type}.js (${platform})`, () => {

                    beforeEach(() => {
                        angularCompilerOptions = null;
                    });

                    it("should be empty by default", () => {
                        const input = getInput({ platform });

                        webpackConfig(input);

                        expect(angularCompilerOptions).toBeDefined();
                        expect(angularCompilerOptions.platformTransformers).toBeDefined();
                        expect(angularCompilerOptions.platformTransformers.length).toEqual(0);
                    });

                    it("should contain the AOT transformer when the AOT flag is passed", () => {
                        const input = getInput({ platform, aot: true });

                        webpackConfig(input);

                        expect(angularCompilerOptions).toBeDefined();
                        expect(angularCompilerOptions.platformTransformers).toBeDefined();
                        expect(angularCompilerOptions.platformTransformers.length).toEqual(1);
                        expect(angularCompilerOptions.platformTransformers[0]).toEqual(FakeAotTransformerFlag);
                    });

                    it("should contain the HMR transformer when the HMR flag is passed", () => {
                        const input = getInput({ platform, hmr: true });

                        webpackConfig(input);

                        expect(angularCompilerOptions).toBeDefined();
                        expect(angularCompilerOptions.platformTransformers).toBeDefined();
                        expect(angularCompilerOptions.platformTransformers.length).toEqual(1);
                        expect(angularCompilerOptions.platformTransformers[0]).toEqual(FakeHmrTransformerFlag);
                    });

                    it("should contain the Lazy transformer when the @angular/core is an external module", () => {
                        const input = getInput({ platform, externals: ["@angular/core"] });

                        webpackConfig(input);

                        expect(angularCompilerOptions).toBeDefined();
                        expect(angularCompilerOptions.platformTransformers).toBeDefined();
                        expect(angularCompilerOptions.platformTransformers.length).toEqual(1);
                        expect(angularCompilerOptions.platformTransformers[0]).toEqual(FakeLazyTransformerFlag);
                    });

                    it("should contain the AOT + HMR transformers when the AOT and HMR flags are passed", () => {
                        const input = getInput({ platform, aot: true, hmr: true });

                        webpackConfig(input);

                        expect(angularCompilerOptions).toBeDefined();
                        expect(angularCompilerOptions.platformTransformers).toBeDefined();
                        expect(angularCompilerOptions.platformTransformers.length).toEqual(2);
                        expect(angularCompilerOptions.platformTransformers).toContain(FakeAotTransformerFlag);
                        expect(angularCompilerOptions.platformTransformers).toContain(FakeHmrTransformerFlag);
                    });

                    it("should set the AOT transformer before the HMR one when the AOT and HMR flags are passed", () => {
                        const input = getInput({ platform, aot: true, hmr: true });

                        webpackConfig(input);

                        expect(angularCompilerOptions).toBeDefined();
                        expect(angularCompilerOptions.platformTransformers).toBeDefined();
                        expect(angularCompilerOptions.platformTransformers.length).toEqual(2);
                        expect(angularCompilerOptions.platformTransformers[0]).toEqual(FakeAotTransformerFlag);
                        expect(angularCompilerOptions.platformTransformers[1]).toEqual(FakeHmrTransformerFlag);
                    });

                    it("should contain the AOT + Lazy transformers when the AOT flag is passed and @angular/core is an external module", () => {
                        const input = getInput({ platform, aot: true, externals: ["@angular/core"] });

                        webpackConfig(input);

                        expect(angularCompilerOptions).toBeDefined();
                        expect(angularCompilerOptions.platformTransformers).toBeDefined();
                        expect(angularCompilerOptions.platformTransformers.length).toEqual(2);
                        expect(angularCompilerOptions.platformTransformers).toContain(FakeAotTransformerFlag);
                        expect(angularCompilerOptions.platformTransformers).toContain(FakeLazyTransformerFlag);
                    });

                    it("should contain the HMR + Lazy transformers when the HMR flag is passed and @angular/core is an external module", () => {
                        const input = getInput({ platform, hmr: true, externals: ["@angular/core"] });

                        webpackConfig(input);

                        expect(angularCompilerOptions).toBeDefined();
                        expect(angularCompilerOptions.platformTransformers).toBeDefined();
                        expect(angularCompilerOptions.platformTransformers.length).toEqual(2);
                        expect(angularCompilerOptions.platformTransformers).toContain(FakeHmrTransformerFlag);
                        expect(angularCompilerOptions.platformTransformers).toContain(FakeLazyTransformerFlag);
                    });

                    it("should contain the AOT + HMR + Lazy transformers when the AOT and HMR flags are passed and @angular/core is an external module", () => {
                        const input = getInput({ platform, aot: true, hmr: true, externals: ["@angular/core"] });

                        webpackConfig(input);

                        expect(angularCompilerOptions).toBeDefined();
                        expect(angularCompilerOptions.platformTransformers).toBeDefined();
                        expect(angularCompilerOptions.platformTransformers.length).toEqual(3);
                        expect(angularCompilerOptions.platformTransformers).toContain(FakeAotTransformerFlag);
                        expect(angularCompilerOptions.platformTransformers).toContain(FakeHmrTransformerFlag);
                        expect(angularCompilerOptions.platformTransformers).toContain(FakeLazyTransformerFlag);
                    });

                    it("should contain the AOT + HMR + Lazy transformers in the proper order when the AOT and HMR flags are passed and @angular/core is an external module", () => {
                        const input = getInput({ platform, aot: true, hmr: true, externals: ["@angular/core"] });

                        webpackConfig(input);

                        expect(angularCompilerOptions).toBeDefined();
                        expect(angularCompilerOptions.platformTransformers).toBeDefined();
                        expect(angularCompilerOptions.platformTransformers.length).toEqual(3);
                        expect(angularCompilerOptions.platformTransformers[0]).toEqual(FakeAotTransformerFlag);
                        expect(angularCompilerOptions.platformTransformers[1]).toEqual(FakeHmrTransformerFlag);
                        expect(angularCompilerOptions.platformTransformers[2]).toEqual(FakeLazyTransformerFlag);
                    });
                });
            }

            describe(`source map for webpack.${type}.js (${platform})`, () => {

                beforeEach(() => {
                    uglifyJsOptions = null;
                });

                it("should not set source maps without the flag", () => {
                    const input = getInput({ platform, sourceMap: false });

                    const config = webpackConfig(input);

                    expect(config.devtool).toEqual("none");
                    expect(uglifyJsOptions.sourceMap).toBeFalsy();
                    expect(config.output.sourceMapFilename).toEqual("[file].map");
                });

                it("should set inline-source-map devtool", () => {
                    const input = getInput({ platform, sourceMap: true });

                    const config = webpackConfig(input);

                    expect(config.devtool).toEqual("inline-source-map");
                    expect(uglifyJsOptions.sourceMap).toBeTruthy();
                    expect(config.output.sourceMapFilename).toEqual("[file].map");
                });
            });

            describe(`hidden source map for webpack.${type}.js (${platform})`, () => {

                beforeEach(() => {
                    uglifyJsOptions = null;
                });

                it("should not set source maps without the flag", () => {
                    const input = getInput({ platform, hiddenSourceMap: false });

                    const config = webpackConfig(input);

                    expect(config.devtool).toEqual("none");
                    expect(uglifyJsOptions.sourceMap).toBeFalsy();
                    expect(config.output.sourceMapFilename).toEqual("[file].map");
                });

                it("should set hidden-source-map devtool and the default sourceMap folder", () => {
                    const input = getInput({ platform, hiddenSourceMap: true });

                    const config = webpackConfig(input);

                    expect(config.devtool).toEqual("hidden-source-map");
                    expect(uglifyJsOptions.sourceMap).toBeTruthy();
                    expect(config.output.sourceMapFilename).toEqual(join("..", "sourceMap", "[file].map"));
                });

                it("should override the sourceMap property and the default sourceMap folder", () => {
                    const input = getInput({ platform, sourceMap: true, hiddenSourceMap: true });

                    const config = webpackConfig(input);

                    expect(config.devtool).toEqual("hidden-source-map");
                    expect(uglifyJsOptions.sourceMap).toBeTruthy();
                    expect(config.output.sourceMapFilename).toEqual(join("..", "sourceMap", "[file].map"));
                });

                it("should set hidden-source-map devtool and override the sourceMapFilename", () => {
                    const newSourceMapFolder = "myCoolSourceMapFolder";
                    const input = getInput({ platform, sourceMap: true, hiddenSourceMap: newSourceMapFolder });

                    const config = webpackConfig(input);

                    expect(config.devtool).toEqual("hidden-source-map");
                    expect(uglifyJsOptions.sourceMap).toBeTruthy();
                    expect(config.output.sourceMapFilename).toEqual(join("..", newSourceMapFolder, "[file].map"));
                });
            });
        });
    });
});
