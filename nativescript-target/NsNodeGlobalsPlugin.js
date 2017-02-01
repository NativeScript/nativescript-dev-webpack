// HACK: Prevent webpack from replacing "global"
// Fixes StackOverflow error caused by DefinePlugin with webpack 2.2+

var ConstDependency = require("webpack/lib/dependencies/ConstDependency");

function NsNodeGlobalsPlugin() {}
NsNodeGlobalsPlugin.prototype.apply = function(compiler) {
    compiler.plugin("compilation", function(compilation, params) {
        params.normalModuleFactory.plugin("parser", function(parser, parserOptions) {
            parser.plugin("expression global", function(expr) {
                var dep = new ConstDependency("global", expr.range);
                dep.loc = expr.loc;
                this.state.current.addDependency(dep);
                return true;
            });
            parser.plugin("expression __dirname", function(expr) {
                var dep = new ConstDependency("__dirname", expr.range);
                dep.loc = expr.loc;
                this.state.current.addDependency(dep);
                return true;
            });
        });
    });
};

module.exports = NsNodeGlobalsPlugin;
