const parse = require("tns-core-modules/css").parse;
const nl = "\n";

module.exports = function(content) {
    const ast = parse(content);
    const dependencies = getImportsFrom(ast)
        .map(mapURI)
        .reduce((dependencies, {uri, requireURI}) =>
            dependencies + `global.registerModule(${uri}, () => require(${requireURI}));${nl}`, "");

    const str = JSON.stringify(ast, (k, v) => k === "position" ? undefined : v);
    return `${dependencies}module.exports = ${str};`;
}

function getImportsFrom(ast) {
    if (!ast || ast.type !== "stylesheet" || !ast.stylesheet) {
        return [];
    }
    return ast.stylesheet.rules
        .filter(rule => rule.type === "import")
        .map(importRule => importRule.import.replace(/[\'\"]/gm, ""));
}

function mapURI(uri) {
    return {
        uri: JSON.stringify(uri),
        requireURI: JSON.stringify(uri[0] === "~" && uri[1] !== "/" ? uri.substr(1) : uri)
    };
}
