import { getConvertedExternals, getEntryPathRegExp, getExternalsHandler } from './index';
const path = require("path");

describe('index', () => {
    describe('getExternalsHandler', () => {
        it('throws an error when the argument is not an array of regular expressions', () => {
            expect(() => getExternalsHandler()).toThrowError();
            expect(() => getExternalsHandler(32)).toThrowError();
            expect(() => getExternalsHandler(null)).toThrowError();
            expect(() => getExternalsHandler("asd")).toThrowError();
            expect(() => getExternalsHandler([{}])).toThrowError();
            expect(() => getExternalsHandler(/((node_modules\/)|^)nativescript-vue((\/.*)|$)/)).toThrowError();
        });

        const externalContextTestCases = [
            {
                name: 'request for another external module from node_modules',
                input: 'nativescript-angular',
                expectedIsExternal: true
            },
            {
                name: 'request for the same module from node_modules',
                input: 'nativescript-vue',
                expectedIsExternal: true
            },
            {
                name: 'request for a relative file in the same external module',
                input: './vue-index',
                expectedIsExternal: true
            },
            {
                name: 'request for a relative file outside the external module',
                input: '../another-non-external-module/another-index',
                expectedIsExternal: false
            },
            {
                name: 'request for an absolute local path',
                input: '/nativescript-vue',
                expectedIsExternal: false
            }
        ];

        externalContextTestCases.forEach(testCase => {
            it(`returns handler which matches requests inside an external module - ${testCase.name}`, (done) => {
                const handler = getExternalsHandler([/((node_modules\/)|^)nativescript-vue((\/.*)|$)/, /((node_modules\/)|^)nativescript-angular((\/.*)|$)/]);
                handler("./node_modules/nativescript-vue/", testCase.input, (error, externalLink) => {
                    if (testCase.expectedIsExternal) {
                        expect(error).toBeNull();
                        expect(externalLink).toBeDefined();
                    } else {
                        expect(error).toBeUndefined();
                        expect(externalLink).toBeUndefined();
                    }
                    done();
                });
            });
        });


        const nonExternalContextTestCases = [
            {
                name: 'request for an external module from node_modules',
                input: 'nativescript-vue',
                expectedIsExternal: true
            },
            {
                name: 'request for a relative file from an external module',
                input: '../node_modules/nativescript-vue/vue-index',
                expectedIsExternal: true
            },
            {
                name: 'request for a relative file inside the app',
                input: './app-module',
                expectedIsExternal: false
            },
            {
                name: 'request for a relative file from a non external module',
                input: '../node_modules/another-non-external-module/another-index',
                expectedIsExternal: false
            },
            {
                name: 'request for an absolute local path',
                input: '/nativescript-vue',
                expectedIsExternal: false
            }
        ];

        nonExternalContextTestCases.forEach(testCase => {
            it(`returns handler which matches requests from inside the app folder - ${testCase.name}`, (done) => {
                const handler = getExternalsHandler([/((node_modules\/)|^)nativescript-vue((\/.*)|$)/]);
                handler("./app/", testCase.input, (error, externalLink) => {
                    if (testCase.expectedIsExternal) {
                        expect(error).toBeNull();
                        expect(externalLink).toBeDefined();
                    } else {
                        expect(error).toBeUndefined();
                        expect(externalLink).toBeUndefined();
                    }
                    done();
                });
            });
        });
    });

    describe('getConvertedExternals', () => {
        it('returns empty array when nullable is passed', () => {
            const actualResult = getConvertedExternals(null);
            expect(actualResult).toEqual([]);
        });

        const testCases = [
            {
                input: ['nativescript-vue'],
                expectedOutput: [/((node_modules\/)|^)nativescript-vue((\/.*)|$)/]
            },
            {
                input: ['nativescript-vue', 'nativescript-angular'],
                expectedOutput: [/((node_modules\/)|^)nativescript-vue((\/.*)|$)/, /((node_modules\/)|^)nativescript-angular((\/.*)|$)/]
            }
        ];

        testCases.forEach(testCase => {
            it('converts passed strings to regular expressions', () => {
                const actualResult = getConvertedExternals(testCase.input);
                expect(actualResult).toEqual(testCase.expectedOutput);
            });

            it(`returns regular expressions which match expected modules and their subdirs, for input ${testCase.input}`, () => {
                [
                    'nativescript-vue',
                    'nativescript-vue/subdir',
                    './node_modules/nativescript-vue/subdir',
                    'nativescript-vue/subdir/subdir-2'
                ].forEach(testString => {
                    const regExpsExternals = getConvertedExternals(testCase.input);
                    const result = regExpsExternals.some((regExp: RegExp) => !!regExp.exec(testString));
                    expect(result).toBe(true, `String ${testString} does not match any of the regular expressions: ${regExpsExternals.join(', ')}`);
                });
            });

            it(`returns regular expressions which does not match expected modules and their subdirs, for input ${testCase.input}`, () => {
                [
                    'nativescript-facebook',
                    'nativescript-facebook/nativescript-vue',
                    'main-plugin/subdir/nativescript-vue',
                    'nativescript-vue-template-compiler',
                    'nativescript-vue-template-compiler/subdir'
                ].forEach(testString => {
                    const regExpsExternals = getConvertedExternals(testCase.input);
                    const result = regExpsExternals.some((regExp: RegExp) => !!regExp.exec(testString));
                    expect(result).toBe(false, `String ${testString} matches some of the regular expressions: ${regExpsExternals.join(', ')}`);
                });
            });
        });
    });

    describe('getEntryPathRegExp', () => {
        const originalPathJoin = path.join;
        const entryModule = "index.js";

        afterEach(() => {
            path.join = originalPathJoin;
        });

        it('returns RegExp that matches Windows', () => {
            const appPath = "D:\\Work\\app1\\app";
            path.join = path.win32.join;
            const regExp = getEntryPathRegExp(appPath, entryModule);
            expect(!!regExp.exec(`${appPath}\\${entryModule}`)).toBe(true);
        });

        it('returns RegExp that works with POSIX paths', () => {
            const appPath = "/usr/local/lib/app1/app";
            path.join = path.posix.join;
            const regExp = getEntryPathRegExp(appPath, entryModule);
            expect(!!regExp.exec(`${appPath}/${entryModule}`)).toBe(true);
        });
    });
});
