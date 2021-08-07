/*
In NativeScript, a file with the same name as an XML file is known as
a code-behind file. The code-behind is a great place to place your view
logic, and to set up your page’s data binding.
*/

import { EventData, Page, Label, Frame } from '@nativescript/core';
import { HelloWorldModel } from './main-view-model';

export function onNavigatingTo(args: EventData) {
    let page = <Page>args.object;
    page.bindingContext = new HelloWorldModel();
    page.getViewById<Label>("platform").text = "android";
}

export function goToSecondPage(args) {
    var topmost = Frame.topmost();
    topmost.navigate("views/second-page");
}
