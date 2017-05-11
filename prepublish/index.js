const { writeFileSync } = require("fs");

saveTemplate("javascript");
saveTemplate("typescript");
saveTemplate("angular");

function saveTemplate(target) {
    const content = buildTemplate(target);
    writeFileSync(`./templates/webpack.${target}.js`, content);
}

function buildTemplate(target) {
    let template = "";

    template += getResource(target, "imports");
    template += getResource(target, "exports");
    template += getResource(target, "getPlatform");

    const rules = getResource(target, "rules");
    template += rulesBuilder(rules);

    const plugins = getResource(target, "plugins");
    template += pluginsBuilder(plugins);

    template += require(`./${target}/getExtensions`);

    return template;
};

function getResource(target, resourceName) {
    const common = require(`./common/${resourceName}`);
    const maybeSpecific = tryRequire(`./${target}/${resourceName}`);

    return merge(resourceName, common, maybeSpecific);
}

function tryRequire(path) {
    try {
        return require(path);
    } catch(e) { }
}

function merge(resource, common, specific) {
    const allResources = specific ? `${common}\n${specific}\n` : `${common}\n`;
    return isArray(resource) ? `[${allResources}    ]` : allResources;
}

function isArray(resource) {
    return ["rules", "plugins"].includes(resource);
}

function pluginsBuilder(plugins) {
    const uglify = require("./common/uglify");
    return `function getPlugins(platform, env) {
    let plugins = ${plugins};
    ${uglify}

    return plugins;
}\n`;
}

function rulesBuilder(rules) {
    return `function getRules() {
    return ${rules};
}\n\n`;
}
