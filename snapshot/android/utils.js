const { chmodSync, createWriteStream, existsSync } = require("fs");
const { tmpdir } = require("os");
const { dirname, join } = require("path");

const { mkdir } = require("shelljs");
const { get } = require("request");
const { getProxySettings } = require("proxy-lib");

const CONSTANTS = {
    SNAPSHOT_TMP_DIR: join(tmpdir(), "snapshot-tools"),
};

const createDirectory = dir => mkdir('-p', dir);

const downloadFile = (url, destinationFilePath) =>
    new Promise((resolve, reject) => {
        getRequestOptions(url)
            .then(options =>
                get(options)
                    .on("error", reject)
                    .pipe(createWriteStream(destinationFilePath, { autoClose: true }))
                    .on("finish", _ => {
                        chmodSync(destinationFilePath, 0755);
                        return resolve(destinationFilePath);
                    })
            ).catch(reject);
    });

const getJsonFile = url =>
    new Promise((resolve, reject) => {
        getRequestOptions(url)
            .then(options =>
                get(options, (error, response, body) => {
                    if (error) {
                        return reject(error);
                    }

                    if (!response || response.statusCode !== 200) {
                        return reject(`Couldn't fetch ${url}! Response:\n${response}`);
                    }

                    try {
                        const data = JSON.parse(body);
                        resolve(data);
                    } catch (error) {
                        reject(`Couldn't parse json data! Original error:\n${error}`);
                    }
                })
            ).catch(reject);
    });

const getRequestOptions = (url) =>
    new Promise((resolve, reject) => {
        const options = { url };
        getProxySettings()
            .then(proxySettings => {
                const allOptions = Object.assign(options, proxySettings);
                resolve(allOptions);
            })
            .catch(error =>
                reject(`Couldn't get proxy settings! Original error:\n${error}`));
    });

module.exports = {
    CONSTANTS,
    createDirectory,
    downloadFile,
    getJsonFile,
};
