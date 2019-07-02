import { loader } from "webpack";
import { convertToUnixPath } from "../lib/utils";
import { extname } from "path";

const extMap = {
    ".css" : "style",
    ".scss" : "style",
    ".less" : "style",
    ".js" : "script",
    ".ts" : "script",
    ".xml" : "markup",
    ".html" : "markup",
}

const loader: loader.Loader = function (source, map) {
    const moduleRelativePath = this.resourcePath.replace(this.rootContext, ".");
    const modulePath = convertToUnixPath(moduleRelativePath);
    const ext = extname(modulePath).toLowerCase();
    const typeStyle = extMap[ext] || "unknown";

    const hotCode = `
if (module.hot && global._shouldAutoAcceptModule && global._shouldAutoAcceptModule(module.id)) {
    console.log("AUTO ACCEPT MODULE: ", module.id, '${modulePath}')
    module.hot.accept();
    module.hot.dispose(() => {
        global.hmrRefresh({ type: '${typeStyle}', path: '${modulePath}' });
    })
}`;

    this.callback(null, `${source};${hotCode}`, map);
};

export default loader;



