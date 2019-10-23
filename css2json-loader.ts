import { parse, Rule, SyntaxTree } from "tns-core-modules/css";
import { loader } from "webpack";

interface ImportRule extends Rule {
    import: string;
}

const betweenQuotesPattern = /('|")(.*?)\1/;
const unpackUrlPattern = /url\(([^\)]+)\)/;

const loader: loader.Loader = function (content: string, map) {
    const ast = parse(content, undefined);

    let dependencies = [];
    getImportRules(ast)
        .map(extractUrlFromRule)
        .map(createRequireUri)
        .forEach(({ uri, requireURI }) => {
            dependencies.push(`global.registerModule("${uri}", () => require("${requireURI}"));`);

            // Call registerModule with requireURI to handle cases like @import "~@nativescript/theme/css/blue.css";
            if (uri !== requireURI) {
                dependencies.push(`global.registerModule("${requireURI}", () => require("${requireURI}"));`);
            }
        });
    const str = JSON.stringify(ast, (k, v) => k === "position" ? undefined : v);
    this.callback(null, `${dependencies.join("\n")}module.exports = ${str};`, map);
}

function getImportRules(ast: SyntaxTree): ImportRule[] {
    if (!ast || (<any>ast).type !== "stylesheet" || !ast.stylesheet) {
        return [];
    }
    return <ImportRule[]>ast.stylesheet.rules
        .filter(rule => rule.type === "import" && (<any>rule).import)
}

/**
 * Extracts the url from import rule (ex. `url("./platform.css")`)
 */
function extractUrlFromRule(importRule: ImportRule): string {
    const urlValue = importRule.import;

    const unpackedUrlMatch = urlValue.match(unpackUrlPattern);
    const unpackedValue = unpackedUrlMatch ? unpackedUrlMatch[1] : urlValue

    const quotesMatch = unpackedValue.match(betweenQuotesPattern);
    return quotesMatch ? quotesMatch[2] : unpackedValue;
};

function createRequireUri(uri): { uri: string, requireURI: string } {
    return {
        uri: uri,
        requireURI: uri[0] === "~" && uri[1] !== "/" ? uri.substr(1) : uri
    };
}



export default loader;