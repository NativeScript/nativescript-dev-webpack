const { chmodSync, createWriteStream, existsSync } = require("fs");
const { get: httpsGet } = require("https");
const { tmpdir } = require("os");
const { dirname, join } = require("path");
const { mkdir } = require("shelljs");

const CONSTANTS = {
    BUNDLE_ENDING_PATH: join(__dirname, "snapshot-generator-tools/bundle-ending.js"),
    BUNDLE_PREAMBLE_PATH: join(__dirname, "snapshot-generator-tools/bundle-preamble.js"),
    INCLUDE_GRADLE_PATH: join(__dirname, "snapshot-generator-tools/include.gradle"),
    MIN_ANDROID_RUNTIME_VERSION: "3.0.0",
    MKSNAPSHOT_TOOLS_DOWNLOAD_ROOT_URL: "https://raw.githubusercontent.com/NativeScript/mksnapshot-tools/master/",
    NDK_BUILD_SEED_PATH: join(__dirname, "snapshot-generator-tools/ndk-build"),
    SNAPSHOT_BLOB_NAME: "TNSSnapshot",
    SNAPSHOT_TMP_DIR: join(tmpdir(), "snapshot-tools"),
    VALID_ANDROID_RUNTIME_TAGS: Object.freeze(["next", "rc"]),
    V8_VERSIONS_FILE_NAME: "v8-versions.json",
    V8_VERSIONS_LOCAL_PATH: resolve(SNAPSHOT_TMP_DIR, V8_VERSIONS_FILE_NAME),
    V8_VERSIONS_URL: `https://raw.githubusercontent.com/NativeScript/android-runtime/master/${V8_VERSIONS_FILE_NAME}`,
};

const createDirectory = dir => mkdir('-p', dir);

const downloadFile = (url, destinationFilePath) =>
    new Promise((resolve, reject) => {
        const request = httpsGet(url, response => {
            switch (response.statusCode) {
                case 200:
                    const file = createWriteStream(destinationFilePath);
                    file.on('error', function (error) {
                        return reject(error);
                    });
                    file.on("finish", function() {
                        file.close();
                        chmodSync(destinationFilePath, 0755);
                        return resolve(destinationFilePath);
                    });
                    response.pipe(file);
                    break;
                case 301:
                case 302:
                case 303:
                    const redirectUrl = response.headers.location;
                    return this.downloadExecFile(redirectUrl, destinationFilePath);
                default:
                    return reject(new Error("Unable to download file at " + url + ". Status code: " + response.statusCode));
            }
        });

        request.end();

        request.on('error', function(err) {
            return reject(err);
        });
    });

const getJsonFile = url =>
    new Promise((resolve, reject) => {
        httpsGet(url, res => {
            let body = "";
            res.on("data", chunk => {
                body += chunk;
            })

            res.on("end", () => {
                const data = JSON.parse(body);
                return resolve(data);
            });
        }).on("error", reject);
    });

module.exports = {
    CONSTANTS,
    createDirectory,
    downloadFile,
    getJsonFile,
};
