require("application");
if (!global["__snapshot"]) {
    /* 
    In case snapshot generation is enabled these modules will get into the bundle but will not be required/evaluated. 
    The snapshot webpack plugin will add them to the tns-java-classes bundle file. This way, they will be evaluated on app start as early as possible.
    */
    require("tns-core-modules/__snapshot/android/early_executed_module.js");
}
