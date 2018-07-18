import {
    parse,
    join,
} from "path";
import { statSync } from "fs";

export function getResolver(platforms: string[]) {
    return function(path: string) {
        const { dir, name, ext } = parse(path);

        for (const platform of platforms) {
            const platformFileName = `${name}.${platform}${ext}`;
            const platformPath = toSystemPath(join(dir, platformFileName));

            try {
                const stat = statSync(platformPath);
                if (stat && stat.isFile()) {
                    return platformPath;
                }
            } catch(_e) {
                // continue checking the other platforms
            }
        }

        return path;
    }
}

// Convert paths from \c\some\path to c:\some\path
function toSystemPath(path: string) {
    if (!process.platform.startsWith("win32")) {
        return path;
    }

    const drive = path.match(/^\\(\w)\\(.*)$/);
    return drive ?
        `${drive[1]}:\\${drive[2]}`:
        path;
}
