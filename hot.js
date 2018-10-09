const hmrPrefix = 'HMR:';
const log = {
    info: (message) => console.info(`${hmrPrefix} ${message}`),
    warn: (message) => console.warn(`${hmrPrefix} ${message}`),
    error: (message) => console.error(`${hmrPrefix} ${message}`),
};
const refresh = 'Application needs to be restarted in order to apply the changes.';
const hotOptions = {
    ignoreUnaccepted: false,
    ignoreDeclined: false,
    ignoreErrored: false,
    onUnaccepted(data) {
        const chain = [].concat(data.chain);
        const last = chain[chain.length - 1];

        if (last === 0) {
            chain.pop();
        }

        log.warn(`Ignored an update to unaccepted module ${chain.join(' ➭ ')}`);
    },
    onDeclined(data) {
        log.warn(`Ignored an update to declined module ${data.chain.join(' ➭ ')}`);
    },
    onErrored(data) {
        log.warn(
            `Ignored an error while updating module ${data.moduleId} <${data.type}>`
        );
        log.warn(data.error);
    },
};

let nextHash;
let currentHash;

function upToDate() {
    return nextHash.indexOf(__webpack_hash__) >= 0;
}

function result(modules, appliedModules) {
    const unaccepted = modules.filter(
        (moduleId) => appliedModules && appliedModules.indexOf(moduleId) < 0
    );

    if (unaccepted.length > 0) {
        log.warn('The following modules could not be updated:');

        for (const moduleId of unaccepted) {
            log.warn(`          ⦻ ${moduleId}`);
        }
    }

    if (!(appliedModules || []).length) {
        log.info('No Modules Updated.');
    } else {
        log.info('The following modules were updated:');

        for (const moduleId of appliedModules) {
            log.info(`         ↻ ${moduleId}`);
        }

        const numberIds = appliedModules.every(
            (moduleId) => typeof moduleId === 'number'
        );
        if (numberIds) {
            log.info(
                'Please consider using the NamedModulesPlugin for module names.'
            );
        }
    }
}

function check(options) {
    module.hot
        .check()
        .then((modules) => {
            if (!modules) {
                log.warn(
                    `Cannot find update. ${refresh}`
                );
                return null;
            }

            return module.hot
                .apply(hotOptions)
                .then((appliedModules) => {
                    if (!upToDate()) {
                        check(options);
                    }

                    result(modules, appliedModules);

                    if (upToDate()) {
                        //Do not modify message - CLI depends on this exact content to determine hmr operation status.
                        log.info(`Successfully applied update with hmr hash ${currentHash}. App is up to date.`);
                    }
                })
                .catch((err) => {
                    const status = module.hot.status();
                    if (['abort', 'fail'].indexOf(status) >= 0) {
                        //Do not modify message - CLI depends on this exact content to determine hmr operation status.
                        log.warn(`Cannot apply update with hmr hash ${currentHash}.`);
                        log.warn(err.stack || err.message);
                    } else {
                        log.warn(`Update failed: ${err.stack || err.message}`);
                    }
                });
        })
        .catch((err) => {
            const status = module.hot.status();
            if (['abort', 'fail'].indexOf(status) >= 0) {
                log.warn(`Cannot check for update. ${refresh}`);
                log.warn(err.stack || err.message);
            } else {
                log.warn(`Update check failed: ${err.stack|| err.message}`);
            }
        });
}

if (module.hot) {
    log.info('Hot Module Replacement Enabled. Waiting for signal.');
} else {
    log.error('Hot Module Replacement is disabled.');
}

function update(latestHash, options) {
    nextHash = latestHash;
    if (!upToDate()) {
        const status = module.hot.status();

        if (status === 'idle') {
            //Do not modify message - CLI depends on this exact content to determine hmr operation status.
            log.info(`Checking for updates to the bundle with hmr hash ${currentHash}.`);
            check(options);
        } else if (['abort', 'fail'].indexOf(status) >= 0) {
            log.warn(
                `Cannot apply update. A previous update ${status}ed. ${refresh}`
            );
        }
    }
};

function getNextHash(hash, getFileContent) {
    const file = getFileContent(`${hash}.hot-update.json`);
    return file.readText().then(hotUpdateContent => {
        if(hotUpdateContent) {
            const manifest = JSON.parse(hotUpdateContent);
            const newHash = manifest.h;
            return getNextHash(newHash, getFileContent);
        } else {
            return Promise.resolve(hash);
        }
    }).catch(error => Promise.reject(error));
}

module.exports = function checkState(initialHash, getFileContent) {
    currentHash = initialHash;
    getNextHash(initialHash, getFileContent).then(nextHash => {
        if(nextHash != initialHash) {
            update(nextHash, {});
        }
    })
}