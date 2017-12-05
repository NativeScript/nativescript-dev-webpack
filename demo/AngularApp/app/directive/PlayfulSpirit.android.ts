import { Directive } from "@angular/core";

@Directive({
    selector: "[playful-spirit]",
    host: {
        "backgroundColor": "#7F9"
    }
})
export class PlayfulSpirit {
}