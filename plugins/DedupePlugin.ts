const { NormalModuleReplacementPlugin } = require('webpack');
const escapeStringRegexp = require('escape-string-regexp');

export class DedupePlugin {
    private map = {};

    constructor() { }

    public apply() {
        const pesho = new NormalModuleReplacementPlugin(/.*/, resource => {
            if (resource.resourceResolveData) {
                try {
                    const dependencyName = resource.resourceResolveData.descriptionFileData.name;
                    const escapedDependencyName = escapeStringRegexp(`${dependencyName}/`);
                    const dependencyVersion = resource.resourceResolveData.descriptionFileData.version;
                    const file = new RegExp(`${escapedDependencyName}.*`).exec(resource.request)[0];
                    const key = `${dependencyName}@${dependencyVersion}:${file}`;
                    if (this.map[key]) {
                        resource.request = this.map[key];
                    } else {
                        this.map[key] = resource.request;
                    }
                } catch (err) { }
            }
        });

        console.log("===== PESHO ======== ", pesho);
    }
}
