import {
    parse,
    join,
} from "path";
import { statSync } from "fs";

import { Observable } from "rxjs";
import {
    Path,
    PathFragment,
} from "@angular-devkit/core";
import {
    FileBuffer,
    Host,
    HostCapabilities,
    HostWatchOptions,
    HostWatchEvent,
    Stats,
} from "@angular-devkit/core/src/virtual-fs/host";
const { NodeJsSyncHost } = require("@angular-devkit/core/node");


export class PlatformReplacementHost<StatsT extends object = {}> implements Host<StatsT> {
    constructor(protected _platforms: string[], protected _delegate = new NodeJsSyncHost()) {
    }

    protected _resolve(path) {
        const { dir, name, ext } = parse(path);

        for (const platform of this._platforms) {
            const newPath = join(dir, `${name}.${platform}${ext}`);

            try {
                const stat = statSync(newPath);
                return stat && stat.isFile() ?
                    newPath :
                    path;
            } catch(_e) {
                // continue checking the other platforms
            }
        }

        return path;
    }

    get capabilities(): HostCapabilities {
        return this._delegate.capabilities;
    }

    write(path: Path, content: FileBuffer): Observable<void> {
        return this._delegate.write(this._resolve(path), content);
    }
    read(path: Path): Observable<FileBuffer> {
        return this._delegate.read(this._resolve(path));
    }
    delete(path: Path): Observable<void> {
        return this._delegate.delete(this._resolve(path));
    }
    rename(from: Path, to: Path): Observable<void> {
        return this._delegate.rename(this._resolve(from), this._resolve(to));
    }

    list(path: Path): Observable<PathFragment[]> {
        return this._delegate.list(this._resolve(path));
    }

    exists(path: Path): Observable<boolean> {
        return this._delegate.exists(this._resolve(path));
    }
    isDirectory(path: Path): Observable<boolean> {
        return this._delegate.isDirectory(this._resolve(path));
    }
    isFile(path: Path): Observable<boolean> {
        return this._delegate.isFile(this._resolve(path));
    }

    stat(path: Path): Observable<Stats<StatsT>> | null {
        return this._delegate.stat(this._resolve(path));
    }

    watch(path: Path, options?: HostWatchOptions): Observable<HostWatchEvent> | null {
        return this._delegate.watch(this._resolve(path), options);
    }
}