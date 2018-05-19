const { parse, relative, join, basename, extname } = require("path");

module.exports = function(source) {
    this.value = source;

    const { XmlParser } = require("tns-core-modules/xml");

    let namespaces = [];
    const parser = new XmlParser((event) => {
        const { namespace, elementName } = event;

        if (
            namespace &&
            !namespace.startsWith("http") &&
            !namespaces.some(n => n.name === namespace)
        ) {
            const localNamespacePath = join(this.rootContext, namespace);
            const localModulePath = join(localNamespacePath, elementName);
            const resolvedPath = tryResolve(localNamespacePath) ||
                tryResolve(localModulePath) ||
                namespace;

            this.addDependency(resolvedPath);
            namespaces.push({ name: namespace, path: resolvedPath });

            const moduleName = `${namespace}/${elementName}`;
            namespaces.push({ name: moduleName, path: resolvedPath });

            const { dir, name } =  parse(resolvedPath);
            const noExtFilename = join(dir, name);

            const xmlFile = `${noExtFilename}.xml`;
            const xmlFileResolved = tryResolve(xmlFile);
            if (xmlFileResolved) {
                this.addDependency(xmlFileResolved);
                namespaces.push({ name: `${moduleName}.xml`, path: xmlFileResolved });
            }

            const cssFile = `${noExtFilename}.css`;
            const cssFileResolved = tryResolve(cssFile);
            if (cssFileResolved) {
                this.addDependency(cssFileResolved);
                namespaces.push({ name: `${moduleName}.css`, path: cssFileResolved });
            }
        }
    }, undefined, true);

    parser.parse(source);

    const moduleRegisters = namespaces
        .map(n =>
            `global.registerModule("${n.name}", function() { return require("${n.path}"); });`
        )
        .join("");

    // escape special whitespace characters
    // see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#Issue_with_plain_JSON.stringify_for_use_as_JavaScript
    const json = JSON.stringify(source)
        .replace(/\u2028/g, '\\u2028')
        .replace(/\u2029/g, '\\u2029');

    const wrapped = `${moduleRegisters}\nmodule.exports = ${json}`;

    this.callback(null, wrapped);
}

function tryResolve(path) {
    try {
        return require.resolve(path);
    } catch(e) {
        // The path couldn't be resolved
        return;
    }
}
