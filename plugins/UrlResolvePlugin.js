const { forEachChild, SyntaxKind } = require("typescript");
const { existsSync } = require("fs");
const { resolve } = require("path");

exports.UrlResolvePlugin = (function() {
    function UrlResolvePlugin(options) {
        if (!options || !options.platform) {
            throw new Error(`Target platform must be specified!`);
        }

        this.platform = options.platform;

        // these are true by default
        this.resolveStylesUrls = options.resolveStylesUrls === undefined || options.resolveStylesUrls;
        this.resolveTemplateUrl = options.resolveTemplateUrl === undefined || options.resolveTemplateUrl;

        if (!this.resolveStylesUrls && !this.resolveTemplateUrl) {
              throw new Error(`resolveStylesUrls and resolveTemplateUrl mustn't both be false`);
        }
    }

    UrlResolvePlugin.prototype.apply = function (compiler) {
        compiler.plugin("make", (compilation, callback) => {
            const aotPlugin = getAotPlugin(compilation);
            aotPlugin._program.getSourceFiles()
                .forEach(sf => this.usePlatformUrl(sf));

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

    UrlResolvePlugin.prototype.usePlatformUrl = function(sourceFile) {
        this.setCurrentDirectory(sourceFile);
        forEachChild(sourceFile, node => this.traverseDecorators(node));
    }

    UrlResolvePlugin.prototype.setCurrentDirectory = function(sourceFile) {
        this.currentDirectory = resolve(sourceFile.path, "..");
    }

    UrlResolvePlugin.prototype.traverseDecorators = function(node) {
        if (node.kind !== SyntaxKind.ClassDeclaration || !node.decorators) {
            return;
        }

        node.decorators.forEach(decorator => {
            this.traverseDecoratorArguments(decorator.expression.arguments);
        });
    }

    UrlResolvePlugin.prototype.traverseDecoratorArguments = function(args) {
        args.forEach(arg => arg.properties && this.traverseProperties(arg.properties));
    }

    UrlResolvePlugin.prototype.traverseProperties = function(properties) {
        properties
            .filter(prop => this.isRelevantNode(prop))
            .forEach(prop => this.traversePropertyElements(prop));
    }

    UrlResolvePlugin.prototype.isRelevantNode = function(property) {
        return this.resolveStylesUrls && property.name.text === "styleUrls" ||
            this.resolveTemplateUrl && property.name.text === "templateUrl"
    }

    UrlResolvePlugin.prototype.traversePropertyElements = function(property) {
        const elements = property.initializer.elements === undefined ? [property.initializer] : property.initializer.elements;

        elements
            .filter(el => !!el.text)
            .filter(el => this.notPlatformUrl(el.text))
            .filter(el => this.noMultiplatformFile(el.text))
            .forEach(el => this.replaceUrlsValue(el));
    }

    UrlResolvePlugin.prototype.notPlatformUrl = function(url) {
        let extensionStartIndex = url.lastIndexOf(".");
        let extension = url.slice(extensionStartIndex);

        return !url.endsWith(`.${this.platform}${extension}`);
    }

    UrlResolvePlugin.prototype.noMultiplatformFile = function(url) {
        let filePath = resolve(this.currentDirectory, url);

        return !existsSync(filePath);
    }

    UrlResolvePlugin.prototype.replaceUrlsValue = function(element) {
        const extensionStartIndex = element.text.lastIndexOf(".");
        const prefix = element.text.slice(0, extensionStartIndex);
        const currentExtension = element.text.slice(extensionStartIndex);

        element.text = `${prefix}.${this.platform}${currentExtension}`;
    }

    return UrlResolvePlugin;
})();
