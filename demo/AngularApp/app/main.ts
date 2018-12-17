// this import should be first in order to load some required settings (like globals and reflect-metadata)
import { platformNativeScriptDynamic } from "nativescript-angular/platform";
import { AppOptions } from "nativescript-angular/platform-common";

import { AppModule } from "./app.module";

let options: AppOptions = {};

if (module["hot"]) {
    const hmrUpdate = require("nativescript-dev-webpack/hmr").hmrUpdate;

    options.hmrOptions = {
        moduleTypeFactory: () => AppModule,
        livesyncCallback: (platformReboot) => {
            console.log("HMR livesyncCallback: Sync...")
            setTimeout(platformReboot, 0);
        },
    }

    hmrUpdate();

    // Path to your app module.
    // You might have to change it if your module is in a different place.
    module["hot"].accept(["./app.module"], global["__hmrRefresh"]);
}

// A traditional NativeScript application starts by initializing global objects, setting up global CSS rules, creating, and navigating to the main page. 
// Angular applications need to take care of their own initialization: modules, components, directives, routes, DI providers. 
// A NativeScript Angular app needs to make both paradigms work together, so we provide a wrapper platform object, platformNativeScriptDynamic, 
// that sets up a NativeScript application and can bootstrap the Angular framework.
platformNativeScriptDynamic(options).bootstrapModule(AppModule);
