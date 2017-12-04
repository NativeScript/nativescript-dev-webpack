import { NinjasComponent } from "./ninjas.component";

export const routes = [
    {
        path: "",
        component: NinjasComponent
    },
    {
        path: "details",
        loadChildren: "~/ninjas/details/ninja.module#NinjaModule",
    },
];
