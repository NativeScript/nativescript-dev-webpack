import * as hot from "../hot";
import { knownFolders } from "tns-core-modules/file-system";

declare const __webpack_require__: any;

export function hmrUpdate() {
    const applicationFiles = knownFolders.currentApp();
    const latestHash = __webpack_require__["h"]();
    return hot(latestHash, filename => applicationFiles.getFile(filename));
}