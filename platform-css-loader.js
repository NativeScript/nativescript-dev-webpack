var cssSuffixMatcher = /(@import.*)\.css/g;
var themeMatcher = /(@import[^'"]*)(['"]~?\/?)nativescript-theme-core(.*)/g;

module.exports = function(source, sourcemap) {
    var newSource = source.replace(cssSuffixMatcher, function (fullMatch, importPrefix) {
        return importPrefix;
    }).replace(themeMatcher, function(fullMatch, importPrefix, pathStart, rest) {
        var quote = pathStart[0];
        return importPrefix + quote + "~nativescript-theme-core" + rest;
    });

    // Support for tests
    if (this.callback) {
        this.callback(null, newSource, sourcemap);
    } else {
        return newSource;
    }
};
