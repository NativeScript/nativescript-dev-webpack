module.exports = function nativescriptTarget(compiler) {
    var options = this;
    var webpackLib = "webpack/lib";

    var NsNodeGlobalsPlugin = require("./NsNodeGlobalsPlugin");
    // Custom template plugin
    var NsJsonpTemplatePlugin = require("./NsJsonpTemplatePlugin");

    var FunctionModulePlugin = require(webpackLib + "/FunctionModulePlugin");
    var NodeSourcePlugin = require(webpackLib + "/node/NodeSourcePlugin");
    var LoaderTargetPlugin = require(webpackLib + "/LoaderTargetPlugin");

    compiler.apply(
        new NsNodeGlobalsPlugin(),
        new NsJsonpTemplatePlugin(options.output),
        new FunctionModulePlugin(options.output),
        new NodeSourcePlugin(options.node),
        new LoaderTargetPlugin("web")
    );
}