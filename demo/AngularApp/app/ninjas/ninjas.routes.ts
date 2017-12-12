import { NinjasComponent } from "./ninjas.component";

export const routes = [
    {
        path: "",
        component: NinjasComponent
    },
    {
        path: "details1",
        loadChildren: "./ninjas/details/ninja.module#NinjaModule",
    },
    {
        path: "details2",
        loadChildren: "~/ninjas/details/ninja.module#NinjaModule",
    },
];
