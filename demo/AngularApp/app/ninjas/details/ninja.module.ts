import { NativeScriptCommonModule, NativeScriptRouterModule } from "@nativescript/angular";
import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";

import { NinjaComponent } from "./ninja.component";
import { routes } from "./ninja.routes";

@NgModule({
    schemas: [NO_ERRORS_SCHEMA],
    imports: [
        NativeScriptRouterModule,
        NativeScriptRouterModule.forChild(routes),
        NativeScriptCommonModule,
    ],
    declarations: [NinjaComponent]
})
export class NinjaModule { }
