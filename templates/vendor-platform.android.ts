require("application");
if (!global["__snapshot"]) {
    /* 
    "ui/frame" and "ui/frame/activity" modules are not snapshotable, so in case snapshot generation is enabled they will get into the bundle but will not be required/evaluated. 
    By adding them to the tns-java-classes.js file they will be evaluated on app start as early as possible.
    */
    require("ui/frame");
    require("ui/frame/activity");
}
