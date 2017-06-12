const VERSION_MATCHER = /(\d+)\.(\d+)\.(\d+)/;
const parseVersion = version => {
    const semver = VERSION_MATCHER.exec(version);

    return semver && semver.length > 3 && semver.splice(1).map(Number);
};

const isVersionValid = version => !!parseVersion(version);

const isVersionGte = (first, second) => {
    if (!isVersionValid(first) || !isVersionValid(second)) {
        return false;
    }

    const [ fMajor, fMinor, fPatch ] = parseVersion(first);
    const [ sMajor, sMinor, sPatch ] = parseVersion(second);

    return (
        fMajor - sMajor ||
        fMinor - sMinor ||
        fPatch - sPatch
    ) >= 0;
}

const sanitize = name => name
    .split("")
    .filter(char => /[a-zA-Z0-9]/.test(char))
    .join("");

module.exports = {
    isVersionGte,
    sanitize,
};

