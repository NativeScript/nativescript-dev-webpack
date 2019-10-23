const parse = require("tns-core-modules/css").parse;

module.exports = function (content, map) {
    const ast = parse(content);

    let dependencies = [];
    getImportsFrom(ast)
        .map(mapURI)
        .forEach(({ uri, requireURI }) => {
            dependencies.push(`global.registerModule(${uri}, () => require(${requireURI}));`);

            // call registerModule with requireURI to handle cases like @import "~@nativescript/theme/css/blue.css";
            if (uri !== requireURI) {
                dependencies.push(`global.registerModule(${requireURI}, () => require(${requireURI}));`);
            }
        });

    const str = JSON.stringify(ast, (k, v) => k === "position" ? undefined : v);
    this.callback(null, `${dependencies.join("\n")}module.exports = ${str};`, map);
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
