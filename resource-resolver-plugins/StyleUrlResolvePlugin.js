const ts = require("typescript");
const fs = require("fs");
const path = require("path");

const StyleUrlResolvePlugin = (function() {
    function StyleUrlResolvePlugin(options) {
        if (!options || !options.platform) {
            throw new Error(`Target platform must be specified!`);
        }

        this.platform = options.platform;
    }

    StyleUrlResolvePlugin.prototype.apply = function (compiler) {
        compiler.plugin("make", (compilation, callback) => {
            const aotPlugin = getAotPlugin(compilation);
            aotPlugin._program.getSourceFiles()
                .forEach(sf => this.usePlatformStyleUrl(sf));

            callback();
        })
    };

    function getAotPlugin(compilation) {
        let maybeAotPlugin = compilation._ngToolsWebpackPluginInstance;
        if (!maybeAotPlugin) {
            throw new Error(`This plugin must be used with the AotPlugin!`);
        }

        return maybeAotPlugin;
    }

    StyleUrlResolvePlugin.prototype.usePlatformStyleUrl = function(sourceFile) {
        this.setCurrentDirectory(sourceFile);
        ts.forEachChild(sourceFile, node => this.traverseDecorators(node));
    }

    StyleUrlResolvePlugin.prototype.setCurrentDirectory = function(sourceFile) {
        this.currentDirectory = path.resolve(sourceFile.path, "..");
    }

    StyleUrlResolvePlugin.prototype.traverseDecorators = function(node) {
        if (node.kind !== ts.SyntaxKind.ClassDeclaration || !node.decorators) {
            return;
        }

        node.decorators.forEach(decorator => {
            this.traverseDecoratorArguments(decorator.expression.arguments);
        });
    }

    StyleUrlResolvePlugin.prototype.traverseDecoratorArguments = function(args) {
        args.forEach(arg => arg.properties && this.traverseProperties(arg.properties));
    }

    StyleUrlResolvePlugin.prototype.traverseProperties = function(properties) {
        properties.filter(isStyleUrls)
            .forEach(prop => this.traversePropertyElements(prop));
    }

    function isStyleUrls(property) {
        return property.name.text === "styleUrls";
    }

    StyleUrlResolvePlugin.prototype.traversePropertyElements = function(property) {
        property.initializer.elements
            .filter(el => !!el.text)
            .filter(el => this.notPlatformUrl(el.text))
            .filter(el => this.noMultiplatformFile(el.text))
            .forEach(el => this.replaceStyleUrlsValue(el));
    }

    StyleUrlResolvePlugin.prototype.notPlatformUrl = function(styleUrl) {
        let extensionStartIndex = styleUrl.lastIndexOf(".");
        let extension = styleUrl.slice(extensionStartIndex);

        return !styleUrl.endsWith(`.${this.platform}${extension}`);
    }

    StyleUrlResolvePlugin.prototype.noMultiplatformFile = function(styleUrl) {
        let stylePath = path.resolve(this.currentDirectory, styleUrl);

        return !fs.existsSync(stylePath);
    }

    StyleUrlResolvePlugin.prototype.replaceStyleUrlsValue = function(element) {
        const extensionStartIndex = element.text.lastIndexOf(".");
        const prefix = element.text.slice(0, extensionStartIndex);
        const currentExtension = element.text.slice(extensionStartIndex);

        element.text = `${prefix}.${this.platform}${currentExtension}`;
    }

    return StyleUrlResolvePlugin;
})();

module.exports = StyleUrlResolvePlugin;
