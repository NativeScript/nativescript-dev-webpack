const { chmodSync, createWriteStream, existsSync } = require("fs");
const { get: httpsGet } = require("https");
const { tmpdir } = require("os");
const { dirname, join } = require("path");
const { mkdir } = require("shelljs");

const CONSTANTS = {
    SNAPSHOT_TMP_DIR: join(tmpdir(), "snapshot-tools"),
};

const createDirectory = dir => mkdir('-p', dir);

const downloadFile = (url, destinationFilePath) =>
    new Promise((resolve, reject) => {
        const request = httpsGet(url, response => {
            switch (response.statusCode) {
                case 200:
                    const file = createWriteStream(destinationFilePath, {autoClose: true});
                    file.on('error', function (error) {
                        return reject(error);
                    });
                    file.on("finish", function() {
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
