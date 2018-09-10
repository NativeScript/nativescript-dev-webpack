const log = console;
const refresh = 'Please refresh the page.';
const hotOptions = {
    ignoreUnaccepted: true,
    ignoreDeclined: true,
    ignoreErrored: true,
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

let lastHash;

function upToDate() {
    return lastHash.indexOf(__webpack_hash__) >= 0;
}

function result(modules, appliedModules) {
    const unaccepted = modules.filter(
        (moduleId) => appliedModules && appliedModules.indexOf(moduleId) < 0
    );

    if (unaccepted.length > 0) {
        let message = 'The following modules could not be updated:';

        for (const moduleId of unaccepted) {
            message += `\n          ⦻ ${moduleId}`;
        }
        log.warn(message);
    }

    if (!(appliedModules || []).length) {
        console.info('No Modules Updated.');
    } else {
        const message = ['The following modules were updated:'];

        for (const moduleId of appliedModules) {
            message.push(`         ↻ ${moduleId}`);
        }

        console.info(message.join('\n'));

        const numberIds = appliedModules.every(
            (moduleId) => typeof moduleId === 'number'
        );
        if (numberIds) {
            console.info(
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
                    `Cannot find update. The server may have been restarted. ${refresh}`
                );
                return null;
            }

            return module.hot
                .apply(hotOptions)
                .then((appliedModules) => {
                    if (!upToDate()) {
                        log.warn("Hashes don't match. Ignoring second update...");
                        // check(options);
                    }

                    result(modules, appliedModules);

                    if (upToDate()) {
                        console.info('App is up to date.');
                    }
                })
                .catch((err) => {
                    const status = module.hot.status();
                    if (['abort', 'fail'].indexOf(status) >= 0) {
                        log.warn(`Cannot apply update. ${refresh}`);
                        log.warn(err.stack || err.message);
                        if (options.reload) {
                            window.location.reload();
                        }
                    } else {
                        log.warn(`Update failed: ${err.stack}` || err.message);
                    }
                });
        })
        .catch((err) => {
            const status = module.hot.status();
            if (['abort', 'fail'].indexOf(status) >= 0) {
                log.warn(`Cannot check for update. ${refresh}`);
                log.warn(err.stack || err.message);
            } else {
                log.warn(`Update check failed: ${err.stack}` || err.message);
            }
        });
}

if (module.hot) {
    console.info('Hot Module Replacement Enabled. Waiting for signal.');
} else {
    console.error('Hot Module Replacement is disabled.');
}

module.exports = function update(currentHash, options) {
    lastHash = currentHash;
    if (!upToDate()) {
        const status = module.hot.status();

        if (status === 'idle') {
            console.info('Checking for updates to the bundle.');
            check(options);
        } else if (['abort', 'fail'].indexOf(status) >= 0) {
            log.warn(
                `Cannot apply update. A previous update ${status}ed. ${refresh}`
            );
        }
    }
};

