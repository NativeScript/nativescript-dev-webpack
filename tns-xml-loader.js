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
    global[ELEMENT_REGISTRY] = {};
}

module.exports = function (source, map) {
    this.cacheable();

    var loader = this;

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
    parser.write(source);
    parser.end();

    this.callback(null, source, map);
};