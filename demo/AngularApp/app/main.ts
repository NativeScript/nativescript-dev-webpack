// this import should be first in order to load some required settings (like globals and reflect-metadata)
import { platformNativeScriptDynamic } from "nativescript-angular/platform";
import { AppOptions } from "nativescript-angular/platform-common";

import { AppModule } from "./app.module";

let options: AppOptions = {};

if (module["hot"]) {
    options.hmrOptions = {
        moduleTypeFactory: () => AppModule,
        livesyncCallback: (platformReboot) => {
            setTimeout(platformReboot, 0);
        },
    }

    module["hot"].accept(["./app.module"], () => {
        // Currently the context is needed only for application style modules.
        const moduleContext = {};
        global["__hmrRefresh"](moduleContext);
    });
}

// A traditional NativeScript application starts by initializing global objects, setting up global CSS rules, creating, and navigating to the main page.
// Angular applications need to take care of their own initialization: modules, components, directives, routes, DI providers.
// A NativeScript Angular app needs to make both paradigms work together, so we provide a wrapper platform object, platformNativeScriptDynamic,
// that sets up a NativeScript application and can bootstrap the Angular framework.
platformNativeScriptDynamic(options).bootstrapModule(AppModule);
