module.exports = function nativescriptTarget(compiler) {
    const options = this;
    const webpackLib = "webpack/lib";

    // Custom template plugin
    const NsJsonpTemplatePlugin = require("./NsJsonpTemplatePlugin");

    const FunctionModulePlugin = require(webpackLib + "/FunctionModulePlugin");
    const NodeSourcePlugin = require(webpackLib + "/node/NodeSourcePlugin");
    const LoaderTargetPlugin = require(webpackLib + "/LoaderTargetPlugin");

    compiler.apply(
        new NsJsonpTemplatePlugin(options.output),
        new FunctionModulePlugin(options.output),
        new NodeSourcePlugin(options.node),
        new LoaderTargetPlugin("web")
    );
}
