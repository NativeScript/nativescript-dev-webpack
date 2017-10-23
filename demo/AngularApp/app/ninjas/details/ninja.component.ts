import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

@Component({
    template: `
        <StackLayout>
            <Label [text]="'Ninja '+ name + '!'" class="h1 text-center"></Label>
            <Button text="Back to ninjas" class="btn btn-primary btn-active"
                [nsRouterLink]="['/ninjas']"></Button>
        </StackLayout>
    `
})
export class NinjaComponent implements OnInit {
    name: String;

    constructor( private route: ActivatedRoute) { }

    ngOnInit(): void {
        this.name = this.route.snapshot.params["name"];
    }

}
