const { chmodSync, createWriteStream, existsSync } = require("fs");
const { tmpdir } = require("os");
const { dirname, join } = require("path");

const { mkdir } = require("shelljs");
const { get } = require("request");

const CONSTANTS = {
    SNAPSHOT_TMP_DIR: join(tmpdir(), "snapshot-tools"),
};

const createDirectory = dir => mkdir('-p', dir);

const downloadFile = (url, destinationFilePath) =>
    new Promise((resolve, reject) => {
        get(url)
            .on("error", reject)
            .pipe(createWriteStream(destinationFilePath, { autoClose: true }))
            .on("finish", _ => {
                 chmodSync(destinationFilePath, 0755);
                 resolve(destinationFilePath);
            });
    });

const getJsonFile = url =>
    new Promise((resolve, reject) => {
        get(url, (error, response, body) => {
            if (error) {
                reject(error);
            }

            const { statusCode } = response;
            if (statusCode !== 200) {
                reject(`Couldn't fetch ${url}! Response status code: ${statusCode}`)
            }

            try {
                const data = JSON.parse(body);
                resolve(data);
            } catch (e) {
                reject(`Couldn't parse json data! Original error:\n${e}`);
            }
        });
    });

module.exports = {
    CONSTANTS,
    createDirectory,
    downloadFile,
    getJsonFile,
};
