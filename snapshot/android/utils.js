const https = require("https");

const shelljs = require("shelljs");

const downloadFile = (url, destinationFilePath) =>
    new Promise((resolve, reject) => {
        const request = https.get(url, response => {
            switch (response.statusCode) {
                case 200:
                    shelljs.mkdir("-p", dirname(destinationFilePath));
                    const file = fs.createWriteStream(destinationFilePath);
                    file.on('error', function (error) {
                        return reject(error);
                    });
                    file.on("finish", function() {
                        file.close();
                        fs.chmodSync(destinationFilePath, 0755);
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
        https.get(url, res => {
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
    downloadFile,
    getJsonFile,
};

