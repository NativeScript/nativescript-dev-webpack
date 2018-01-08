const fs = require("fs");
const { join, dirname } = require("path");
const shelljs = require("shelljs");

function TnsJavaClassesGenerator() {}
module.exports = TnsJavaClassesGenerator;

TnsJavaClassesGenerator.prototype.generate = function(generationOptions) {
    // Arguments validation
    generationOptions = generationOptions || {};
    if (!generationOptions.projectRoot) { throw new Error("No projectRoot specified."); }
    var initialSettings = generationOptions.options || { modules: [], packages: [] };
    initialSettings.modules = initialSettings.modules || [];
    initialSettings.packages = initialSettings.packages || [];

    const packageJsonPath = join(generationOptions.projectRoot, "package.json");
    const nodeModulesPath = join(generationOptions.projectRoot, "node_modules");

    /*
    "tns-java-classes": {
        "modules": ["packageX/moduleX", "./app/moduleY"],
        "packages": ["package1", "package2"]
    }
    */
    var tnsJavaClassesSettings = this.getTnsJavaClassesSettings(packageJsonPath);
    Array.prototype.push.apply(initialSettings.modules, tnsJavaClassesSettings.modules);
    Array.prototype.push.apply(initialSettings.packages, tnsJavaClassesSettings.packages);

    var nodeModules = fs.readdirSync(nodeModulesPath).filter((moduleName) => initialSettings.packages.indexOf(moduleName) >= 0);
    for(var i = 0; i < nodeModules.length; i++) {
        var moduleName = nodeModules[i];
        var modulePackageJsonPath = join(nodeModulesPath, moduleName, "package.json");
        var moduleTnsJavaClassesSettings = this.getTnsJavaClassesSettings(modulePackageJsonPath);
        // Backward compatibilty with modules 3.0.1 and below
        if (moduleName == "tns-core-modules" && moduleTnsJavaClassesSettings.modules.length == 0) {
            moduleTnsJavaClassesSettings = { modules: ["ui/frame/activity", "ui/frame/fragment"] };
        }
        Array.prototype.push.apply(initialSettings.modules, moduleTnsJavaClassesSettings.modules);
    }

    // Generate the file
    var tnsJavaClassesFileContent = initialSettings.modules.map(moduleName => "require(\"" + moduleName + "\");").join("\n");
    if (generationOptions.output) {
        shelljs.mkdir("-p", dirname(generationOptions.output));
        if (generationOptions.outputAppend) {
            var currentFileContent = shelljs.test("-e", generationOptions.output) ? fs.readFileSync(generationOptions.output, "utf8") : "";
            tnsJavaClassesFileContent = currentFileContent + tnsJavaClassesFileContent;
        }
        fs.writeFileSync(generationOptions.output, tnsJavaClassesFileContent, { encoding: "utf8" });
    }
    return tnsJavaClassesFileContent;
}

TnsJavaClassesGenerator.prototype.getTnsJavaClassesSettings = function(packageJsonPath) {
    var packageJson = shelljs.test("-e", packageJsonPath) ? JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) : {};
    if (packageJson.snapshot && 
        packageJson.snapshot.android && 
        packageJson.snapshot.android["tns-java-classes"]) {
        var extendedJavaClasses = packageJson.snapshot.android["tns-java-classes"];
        extendedJavaClasses.modules = extendedJavaClasses.modules || [];
        extendedJavaClasses.packages = extendedJavaClasses.packages || [];
        return extendedJavaClasses;
    }

    return { modules: [], packages: [] };
}