/*
In NativeScript, a file with the same name as an XML file is known as
a code-behind file. The code-behind is a great place to place your view
logic, and to set up your page’s data binding.
*/

import { EventData } from 'tns-core-modules/data/observable';
import { Page } from 'tns-core-modules/ui/page';
import { Label } from 'tns-core-modules/ui/label';
import * as frameModule from 'tns-core-modules/ui/frame';
import { HelloWorldModel } from './main-view-model';

export function onNavigatingTo(args: EventData) {
    let page = <Page>args.object;
    page.bindingContext = new HelloWorldModel();
    page.getViewById<Label>("platform").text = "android";
}

export function goToSecondPage(args) {
    var topmost = frameModule.topmost();
    topmost.navigate("views/second-page");
}
