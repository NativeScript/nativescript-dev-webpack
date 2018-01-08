import { parse as parseFile, join, basename, relative } from "path";
import * as minimatch from "minimatch";

export interface PlatformFSPluginOptions {
    /**
     * The target platform.
     */
    platform?: string;

    /**
     * A list of all platforms. By default it is `["ios", "android"]`.
     */
    platforms?: string[];

    /**
     * An array of minimatch expressions used to filter nodes from the file system.
     */
    ignore?: string[];
}

export class PlatformFSPlugin {
    protected readonly platform: string;
    protected readonly platforms: ReadonlyArray<string>;
    protected readonly ignore: ReadonlyArray<string>;
    protected context: string;

    constructor({ platform, platforms, ignore }: PlatformFSPluginOptions) {
        this.platform = platform || "";
        this.platforms = platforms || ["ios", "android"];
        this.ignore = ignore || [];
    }

    public apply(compiler) {
        this.context = compiler.context;
        compiler.inputFileSystem = mapFileSystem({
            fs: compiler.inputFileSystem,
            platform: this.platform,
            platforms: this.platforms,
            ignore: this.ignore,
            context: this.context
        });
    }
}

export interface MapFileSystemArgs {
    /**
     * This is the underlying webpack compiler.inputFileSystem, its interface is similar to Node's fs.
     */
    readonly fs: any;
    readonly context: string;
    readonly platform: string;
    readonly platforms: ReadonlyArray<string>;
    readonly ignore: ReadonlyArray<string>;
}

export function mapFileSystem(args: MapFileSystemArgs): any {
    let { fs, platform, platforms, ignore, context } = args;
    ignore = args.ignore || [];

    const minimatchFileFilters = ignore.map(pattern => {
        const minimatchFilter = minimatch.filter(pattern);
        return file => minimatchFilter(relative(context, file));
    });

    const isIgnored = file => minimatchFileFilters.some(filter => filter(file));

    const alienPlatforms = platforms.filter(p => p !== platform);
    const alienPlatformFilters = alienPlatforms
        .map(platform => `.${platform}.`)
        .map(contains => baseFileName => baseFileName.indexOf(contains) !== -1);

    const isNotAlienPlatformFile = file => !alienPlatformFilters.some(filter => filter(basename(file)));

    const currentPlatformExt = `.${platform}`;

    const trimPlatformSuffix = file => {
        const {dir, name, ext} = parseFile(file);
        if (name.endsWith(currentPlatformExt)) {
            return join(dir, name.substr(0, name.length - currentPlatformExt.length) + ext);
        }
        return file;
    }

    const isNotIgnored = file => !isIgnored(file);

    const mappedFS: any = {
        get _statStorage() { return fs._statStorage; },
        get _readFileStorage() { return fs._readFileStorage; },
        get _readdirStorage() { return fs._readdirStorage; }
    };

    ["readFile", "provide", "stat", "readJson", "readlink"].forEach(mapPath);
    ["readdir"].forEach(filterResultingFiles);

    function platformSpecificFile(file: string): string {
        const {dir, name, ext} = parseFile(file);
        const platformFilePath = join(dir, `${name}.${platform}${ext}`);
        return platformFilePath;
    }

    function listWithPlatformSpecificFiles(files: string[]): string[] {
        const mappedFiles = [];
        files.forEach(file => {
            mappedFiles.push(file);
            mappedFiles.push(platformSpecificFile(file));
        });
        return mappedFiles;
    }

    /**
     * Maps and filters the input files.
     * Expects array with absolute paths.
     * Returns array with absolute paths.
     */
    function filterIgnoredFilesAlienFilesAndMap(files: string[]): string[] {
        const mappedFiles = files
            .filter(isNotIgnored)
            .filter(isNotAlienPlatformFile)
            .map(trimPlatformSuffix);
        const uniqueMappedFiles = Array.from(new Set(mappedFiles));
        return uniqueMappedFiles;
    }

    const platformSuffix = "." + platform + ".";
    mappedFS.watch = function(
        files,
        dirs,
        missing,
        startTime,
        watchOptions,
        callback: (
            err,
            filesModified,
            contextModified,
            missingModified,
            fileTimestamps,
            contextTimestamps
        ) => void) {

        const mappedFiles = listWithPlatformSpecificFiles(files);

        const callbackCalled = function(
                err,
                filesModified,
                contextModified,
                missingModified,
                fileTimestamps,
                contextTimestamps) {

            const mappedFilesModified = filterIgnoredFilesAlienFilesAndMap(filesModified);

            const mappedTimestamps = {};
            for(const file in fileTimestamps) {
                const timestamp = fileTimestamps[file];
                mappedTimestamps[file] = timestamp;
                const platformSuffixIndex = file.lastIndexOf(platformSuffix);
                if (platformSuffixIndex != -1) {
                    const mappedFile = file.substr(0, platformSuffixIndex) + file.substr(platformSuffixIndex + platformSuffix.length - 1);
                    if (!(mappedFile in fileTimestamps)) {
                        mappedTimestamps[mappedFile] = timestamp;
                    }
                }
            }

            callback.call(this, err, mappedFilesModified, contextModified, missingModified, mappedTimestamps, contextTimestamps);
        }

        fs.watch(mappedFiles, dirs, missing, startTime, watchOptions, callbackCalled);
    }

    /**
     * For FS functions that get as first argument a file path,
     * this will map it to a platform specific file if such file exists or fallback to the default.
     * Also the last argument must be a function that handles results such as (err, files[]),
     * it will invoke err for files that are ignored.
     */
    function mapPath(fName) {
        const base = fs[fName];
        mappedFS[fName] = function() {
            const args = arguments;
            const originalFilePath = args[0];
            const callback = args[args.length - 1];
            if (isIgnored(originalFilePath)) {
                callback(new Error("File " + originalFilePath + " is ignored!"));
                return;
            }
            const platformFilePath = platformSpecificFile(originalFilePath);
            fs.stat(platformFilePath, (err, stat) => {
                if (!err && stat && stat.isFile()) {
                    args[0] = platformFilePath;
                }
                base.apply(fs, args);
            });
        };
    }

    /**
     * For FS functions that get as a last argument a function,
     * that handles results such as (err, files[]),
     * will filter and map the returned files[].
     */
    function filterResultingFiles(name) {
        const base = fs[name];
        mappedFS[name] = function() {
            const dir = arguments[0];
            const callback = arguments[arguments.length - 1];
            if (isIgnored(dir)) {
                // Return empty file list for filtered directories.
                callback(null, []);
                return;
            }
            arguments[arguments.length - 1] = function(err, files: string[]) {
                if (err) {
                    callback(err);
                } else {
                    // Create absolute paths for "ignored" testing, map platforms, and return back the base name.
                    const absoluteFilePaths = files.map(file => join(dir, file));
                    const resultAbsolute = filterIgnoredFilesAlienFilesAndMap(absoluteFilePaths);
                    const resultFileNames = resultAbsolute.map(f => basename(f));
                    callback(null, resultFileNames);
                }
            }
            base.apply(fs, arguments);
        }
    }

    return mappedFS;
}
