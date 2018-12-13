const { parse, relative, join, basename, extname } = require("path");
const { promisify } = require('util');
const { convertSlashesInPath } = require("./projectHelpers");

module.exports = function (source) {
    this.value = source;
    const { ignore } = this.query;
    const callback = this.async();

    const { XmlParser } = require("tns-core-modules/xml");

    const resolvePromise = promisify(this.resolve);
    const promises = [];

    const namespaces = [];
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

            const pathResolved = (resolvedPath) => {
                this.addDependency(resolvedPath);

                namespaces.push({ name: namespace, path: resolvedPath });
                namespaces.push({ name: moduleName, path: resolvedPath });

                const { dir, name } = parse(resolvedPath);
                const noExtFilename = join(dir, name);

                return Promise.all([
                    resolvePromise(this.context, `${noExtFilename}.xml`)
                        .then((xml) => {
                            this.addDependency(xml);
                            namespaces.push({ name: `${moduleName}.xml`, path: xml });
                        })
                        .catch((err) => {}),

                    resolvePromise(this.context, `${noExtFilename}.css`)
                        .then((xml) => {
                            this.addDependency(xml);
                            namespaces.push({ name: `${moduleName}.css`, path: css });
                        })
                        .catch((err) => {})
                ]);
            };

            promises.push(resolvePromise(this.context, localNamespacePath)
                .then(path => pathResolved(path))
                .catch(() => {
                    return promise = resolvePromise(this.context, localModulePath)
                        .then(path => pathResolved(path))
                        .catch(() => {
                            return Promise.all([
                                resolvePromise(this.context, `${localModulePath}.xml`)
                                    .then((xml) => {
                                        namespaces.push({ name: `${moduleName}.xml`, path: xml });
                                        namespaces.push({ name: moduleName, path: xml });
                                        this.addDependency(xml);
                                    })
                                    .catch(() => {
                                        namespaces.push({ name: namespace, path: namespace });
                                        namespaces.push({ name: moduleName, path: namespace });
                                    }),

                                resolvePromise(this.context, `${localModulePath}.css`)
                                    .then((css) => {
                                        namespaces.push({ name: `${moduleName}.css`, path: css });
                                        this.addDependency(css);
                                    })
                                    .catch(() => {})
                            ]);

                        });
                })
            );
        }
    }, undefined, true);

    parser.parse(source);

    Promise.all(promises).then(() => {
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

        callback(null, wrapped);
    }).catch((err) => {
        callback(err);
    })

}

function convertPath(obj) {
    obj.path = convertSlashesInPath(obj.path);
    return obj;
}
