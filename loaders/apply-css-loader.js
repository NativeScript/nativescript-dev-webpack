module.exports = function(content) {
    if (this.request.match(/\/app\.(css|scss|less|sass)$/)) {
        return content;
    }
    content += `
    const application = require("tns-core-modules/application");
    require("tns-core-modules/ui/styling/style-scope");

    exports.forEach(cssExport => {
        if (cssExport.length > 1 && cssExport[1]) {
            // applying the second item of the export as it contains the css contents
            application.addCss(cssExport[1]);
        }
    });
    `;

    return content;
}