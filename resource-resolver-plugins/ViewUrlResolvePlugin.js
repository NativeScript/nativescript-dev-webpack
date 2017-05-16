const ts = require("typescript");
const fs = require("fs");
const path = require("path");

const ViewUrlResolvePlugin = (function() {
    function ViewUrlResolvePlugin(options) {
        if (!options || !options.platform) {
            throw new Error(`Target platform must be specified!`);
        }

        this.platform = options.platform;
    }

    ViewUrlResolvePlugin.prototype.apply = function (compiler) {
        compiler.plugin("make", (compilation, callback) => {
            const aotPlugin = getAotPlugin(compilation);
            aotPlugin._program.getSourceFiles()
                .forEach(sf => this.usePlatformViewUrl(sf));

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

    ViewUrlResolvePlugin.prototype.usePlatformViewUrl = function(sourceFile) {
        this.setCurrentDirectory(sourceFile);
        ts.forEachChild(sourceFile, node => this.traverseDecorators(node));
    }

    ViewUrlResolvePlugin.prototype.setCurrentDirectory = function(sourceFile) {
        this.currentDirectory = path.resolve(sourceFile.path, "..");
    }

    ViewUrlResolvePlugin.prototype.traverseDecorators = function(node) {
        if (node.kind !== ts.SyntaxKind.ClassDeclaration || !node.decorators) {
            return;
        }

        node.decorators.forEach(decorator => {
            this.traverseDecoratorArguments(decorator.expression.arguments);
        });
    }

    ViewUrlResolvePlugin.prototype.traverseDecoratorArguments = function(args) {
        args.forEach(arg => arg.properties && this.traverseProperties(arg.properties));
    }

    ViewUrlResolvePlugin.prototype.traverseProperties = function(properties) {
        properties.filter(isTemplateUrl)
            .forEach(prop => this.traversePropertyElements(prop));
    }

    function isTemplateUrl(property) {
        return property.name.text === "templateUrl";
    }

    ViewUrlResolvePlugin.prototype.traversePropertyElements = function(property) {
      [property.initializer]
            .filter(el => this.notPlatformUrl(el.text))
            .filter(el => this.noMultiplatformFile(el.text))
            .forEach(el => this.replaceViewUrlValue(el));
    }

    ViewUrlResolvePlugin.prototype.notPlatformUrl = function(viewUrl) {
        let extensionStartIndex = viewUrl.lastIndexOf(".");
        let extension = viewUrl.slice(extensionStartIndex);


      return !viewUrl.endsWith(`.${this.platform}${extension}`);
    }

    ViewUrlResolvePlugin.prototype.noMultiplatformFile = function(viewUrl) {
        let viewPath = path.resolve(this.currentDirectory, viewUrl);

        return !fs.existsSync(viewPath);
    }

    ViewUrlResolvePlugin.prototype.replaceViewUrlValue = function(element) {
        const extensionStartIndex = element.text.lastIndexOf(".");
        const prefix = element.text.slice(0, extensionStartIndex);
        const currentExtension = element.text.slice(extensionStartIndex);

        element.text = `${prefix}.${this.platform}${currentExtension}`;
    }

    return ViewUrlResolvePlugin;
})();

module.exports = ViewUrlResolvePlugin;
