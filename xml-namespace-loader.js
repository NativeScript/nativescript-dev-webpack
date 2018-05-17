module.exports = function(source) {
    this.value = source;

    const { XmlParser } = require("tns-core-modules/xml");

    let namespaces = [];
    const parser = new XmlParser((event) => {
        const namespace = event.namespace;
        if (
            namespace &&
            !namespace.startsWith("http") &&
            namespaces.indexOf(namespace) === -1
        ) {
            namespaces.push(namespace);
        }
    }, undefined, true);
    parser.parse(source);

    const registerModules = namespaces
        .map(n =>
            `global.registerModule("${n}", function() { return require("${n}"); })`
        )
        .join(";");

    // escape special whitespace characters
    // see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#Issue_with_plain_JSON.stringify_for_use_as_JavaScript
    const json = JSON.stringify(source)
        .replace(/\u2028/g, '\\u2028')
        .replace(/\u2029/g, '\\u2029');

    const wrapped = `${registerModules}\nmodule.exports = ${json}`;

    this.callback(null, wrapped);
}
