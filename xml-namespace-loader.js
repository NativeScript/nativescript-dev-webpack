const { parse, relative, join, basename, extname } = require("path");
const { convertSlashesInPath } = require("./projectHelpers");

module.exports = function (source) {
    this.value = source;
    const { ignore } = this.query;

    const { XmlParser } = require("tns-core-modules/xml");

    let namespaces = [];
    const parser = new XmlParser((event) => {
        const { namespace, elementName } = event;
        const moduleName = `${namespace}/${elementName}`;

        if (
            namespace &&
            !namespace.startsWith("http") &&
            !namespaces.some(n => n.name === moduleName) &&
            (!ignore || !moduleName.match(ignore))
        ) {
            const localNamespacePath = join(this.rootContext, namespace);
            const localModulePath = join(localNamespacePath, elementName);
            const resolvedPath = tryResolve(localNamespacePath) ||
                tryResolve(localModulePath);

            if (!resolvedPath) {
                const xml = tryResolve(`${localModulePath}.xml`);
                if (!xml) {
                    namespaces.push({ name: namespace, path: namespace });
                    namespaces.push({ name: moduleName, path: namespace });

                    return;
                } else {
                    namespaces.push({ name: `${moduleName}.xml`, path: xml });
                    namespaces.push({ name: moduleName, path: xml });
                    this.addDependency(xml);
                }

                const css = tryResolve(`${localModulePath}.css`);
                if (css) {
                    namespaces.push({ name: `${moduleName}.css`, path: css });
                    this.addDependency(css);
                }

                return;
            }

            this.addDependency(resolvedPath);

            namespaces.push({ name: namespace, path: resolvedPath });
            namespaces.push({ name: moduleName, path: resolvedPath });

            const { dir, name } = parse(resolvedPath);
            const noExtFilename = join(dir, name);

            const xml = tryResolve(`${noExtFilename}.xml`);
            if (xml) {
                this.addDependency(xml);
                namespaces.push({ name: `${moduleName}.xml`, path: xml });
            }

            const css = tryResolve(`${noExtFilename}.css`);
            if (css) {
                this.addDependency(css);
                namespaces.push({ name: `${moduleName}.css`, path: css });
            }
        }
    }, undefined, true);

    parser.parse(source);

    const moduleRegisters = namespaces
        .map(convertPath)
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

function convertPath(obj) {
    obj.path = convertSlashesInPath(obj.path);
    return obj;
}

function tryResolve(path) {
    try {
        return require.resolve(path);
    } catch (e) {
        // The path couldn't be resolved
        return;
    }
}
