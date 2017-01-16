var htmlparser = require("htmlparser2");

var UI_PATH = "ui/";

var MODULES = {
    "TabViewItem": "ui/tab-view",
    "FormattedString": "text/formatted-string",
    "Span": "text/span",
    "ActionItem": "ui/action-bar",
    "NavigationButton": "ui/action-bar",
    "SegmentedBarItem": "ui/segmented-bar",
};

var ELEMENT_REGISTRY = "ELEMENT_REGISTRY";

if (!global[ELEMENT_REGISTRY]) {
    global[ELEMENT_REGISTRY] = {
        "ui/proxy-view-container": "ProxyViewContainer",
        "ui/placeholder": "Placeholder"
    };
}

function parseResource(source, map) {
    this.cacheable();

    let templateSource;
    try {
        templateSource = getTemplateSource(this.resourcePath, source);
    } catch(e) {
        this.emitWarning(e.message);
        return this.callback(null, source, map);
    }

    if (templateSource === "") {
        return this.callback(null, source, map);
    }

    var parser = new htmlparser.Parser({
        onopentag: function (name, attribs) {
            // kebab-case to CamelCase
            var elementName = name.split("-").map(function (s) { return s[0].toUpperCase() + s.substring(1); }).join("");

            // Module path from element name
            var modulePath = MODULES[elementName] || UI_PATH +
                (elementName.toLowerCase().indexOf("layout") !== -1 ? "layouts/" : "") +
                elementName.split(/(?=[A-Z])/).join("-").toLowerCase();

            // Update ELEMENT_REGISTRY
            global[ELEMENT_REGISTRY][modulePath] = elementName;
        }
    }, { decodeEntities: true, lowerCaseTags: false });

    parser.write(templateSource);
    parser.end();

    return this.callback(null, source, map);
}

function getTemplateSource(path, source) {
    if (isTemplate(path)) {
        return source;
    } else if (isComponent(path)) {
        const templateMatcher = /template\s*:\s*([`'"])((.|\n)*?)\1/;
        return templateMatcher.test(source) ? source.replace(templateMatcher, "$2") : "";
    } else {
        throw new Error(`The NativeScript XML loader must be used with HTML, XML or TypeScript files`);
    }
}

function isComponent(resource) {
    return /\.ts$/i.test(resource);
}

function isTemplate(resource) {
    return /\.html$|\.xml$/i.test(resource);
}

module.exports = parseResource;
