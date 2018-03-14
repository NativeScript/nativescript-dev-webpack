import { NativeScriptCommonModule } from "nativescript-angular/common";
import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptRouterModule } from "nativescript-angular/router";

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
