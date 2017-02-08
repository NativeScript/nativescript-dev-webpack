var installer = require("./installer");

installer.addProjectFiles();
installer.removeDeprecatedNpmScripts();
installer.addNpmScripts();
installer.addProjectDependencies();
