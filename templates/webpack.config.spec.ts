import * as proxyquire from 'proxyquire';
// With noCallThru enabled, `proxyquire` will not fallback to requiring real module to populate properties that are not mocked.
// This allows us to mock packages that are not available in node_modules.
// In case you want to enable fallback for a specific object, just add `'@noCallThru': false`.
proxyquire.noCallThru();

class EmptyClass { };

const nativeScriptDevWebpack = {
	GenerateBundleStarterPlugin: EmptyClass,
	WatchStateLoggerPlugin: EmptyClass,
	PlatformFSPlugin: EmptyClass,
	getAppPath: () => 'app',
	getEntryModule: () => 'EntryModule',
	getResolver: () => null
};

const emptyObject = {};

const webpackConfigAngular = proxyquire('./webpack.angular', {
	'nativescript-dev-webpack': nativeScriptDevWebpack,
	'nativescript-dev-webpack/nativescript-target': emptyObject,
	'nativescript-dev-webpack/transformers/ns-replace-bootstrap': emptyObject,
	'nativescript-dev-webpack/transformers/ns-replace-lazy-loader': emptyObject,
	'nativescript-dev-webpack/utils/ast-utils': emptyObject,
	'@ngtools/webpack': {
		AngularCompilerPlugin: EmptyClass
	}
});

const webpackConfigTypeScript = proxyquire('./webpack.typescript', {
	'nativescript-dev-webpack': nativeScriptDevWebpack,
	'nativescript-dev-webpack/nativescript-target': emptyObject,
});

const webpackConfigJavaScript = proxyquire('./webpack.javascript', {
	'nativescript-dev-webpack': nativeScriptDevWebpack,
	'nativescript-dev-webpack/nativescript-target': emptyObject,
});

const webpackConfigVue = proxyquire('./webpack.vue', {
	'nativescript-dev-webpack': nativeScriptDevWebpack,
	'nativescript-dev-webpack/nativescript-target': emptyObject,
	'vue-loader/lib/plugin': EmptyClass,
	'nativescript-vue-template-compiler': emptyObject
});

describe('webpack.config.js', () => {
	[
		{ type: 'javascript', webpackConfig: webpackConfigJavaScript },
		{ type: 'typescript', webpackConfig: webpackConfigTypeScript },
		{ type: 'angular', webpackConfig: webpackConfigAngular },
		{ type: 'vue', webpackConfig: webpackConfigVue }
	].forEach(element => {
		const { type, webpackConfig } = element;

		describe(`verify externals for webpack.${type}.js`, () => {
			const getInput = (platform: string, externals: string[]) => {
				const input: any = { externals };
				input[platform] = true;
				return input;
			};

			[
				'android',
				'ios'
			].forEach(platform => {
				describe(`for ${platform}`, () => {
					it('returns empty array when externals are not passed', () => {
						const config = webpackConfig(getInput(platform, null));
						expect(config.externals).toEqual([]);
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
						const input = getInput(platform, testCase.input);

						it(`are correct regular expressions, for input ${testCase.input}`, () => {
							const config = webpackConfig(input);
							expect(config.externals).toEqual(testCase.expectedOutput);
						});

						it(`returns regular expressions which match expected modules and their subdirs, for input ${testCase.input}`, () => {
							const config = webpackConfig(input);

							[
								'nativescript-vue',
								'nativescript-vue/subdir',
								'nativescript-vue/subdir/subdir-2'
							].forEach(testString => {
								const result = config.externals.some((regExp: RegExp) => !!regExp.exec(testString));
								expect(result).toBe(true, `String ${testString} does not match any of the regular expressions: ${config.externals.join(', ')}`);
							});
						});

						it(`returns regular expressions which does not match expected modules and their subdirs, for input ${testCase.input}`, () => {
							const config = webpackConfig(input);

							[
								'nativescript-facebook',
								'nativescript-facebook/nativescript-vue',
								'main-plugin/subdir/nativescript-vue',
								'nativescript-vue-template-compiler',
								'nativescript-vue-template-compiler/subdir'
							].forEach(testString => {
								const result = config.externals.some((regExp: RegExp) => !!regExp.exec(testString));
								expect(result).toBe(false, `String ${testString} matches some of the regular expressions: ${config.externals.join(', ')}`);
							});
						});
					});
				});
			});
		});
	});
});
