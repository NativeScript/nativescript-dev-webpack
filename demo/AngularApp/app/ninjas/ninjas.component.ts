import { Component } from "@angular/core";

@Component({
    template: `
        <StackLayout>
            <Label text="Ninjas!" class="h1 text-center"></Label>

            <ListView [items]="ninjas" class="list-group">
                <ng-template let-ninja="item">
                        <Label
                            class="list-group-item"
                            color="white"
                            [backgroundColor]="ninja.color"
                            [text]="ninja.name"
                            [nsRouterLink]="['details', ninja.name]"></Label>
                </ng-template>
            </ListView>

            <Button text="Go back home" class="btn btn-primary btn-active"
                [nsRouterLink]="['/']"></Button>
        </StackLayout>
    `
})
export class NinjasComponent {
    ninjas = [
        { name: "Michaelangelo", color: "orange" },
        { name: "Leonardo", color: "blue" },
        { name: "Raphaelo", color: "red" },
        { name: "Donatello", color: "purple" }
    ];
}
