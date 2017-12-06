import { AppiumDriver, createDriver, SearchOptions } from "nativescript-dev-appium";
import { assert } from "chai";

describe("sample scenario", () => {
    const defaultWaitTime = 5000;
    let driver: AppiumDriver;

    before(async () => {
        driver = await createDriver();
    });

    beforeEach(async function () { });

    afterEach(async function () {
        if (this.currentTest.state === "failed") {
            await driver.logScreenshot(this.currentTest.title);
        }
    });

    after(async () => {
        await driver.quit();
        console.log("Quit driver!");
    });

    it("should find platform specific items", async () => {
        const items = await getItems();
        assert.isTrue(items.length > 1);
    });

    // it("should have CSS applied on items", async () => {
    //     const screen = await driver.compareScreen("items-component");
    //     assert.isTrue(screen);
    // });

    it("should find Ninjas", async () => {
        const btnNinjas = await driver.findElementByText("Ninjas");
        await btnNinjas.click();
        const lblNinjas = await driver.findElementByText("Ninjas!");
    });

    // it("should have CSS applied on Ninjas", async () => {
    //     const screen = await driver.compareScreen("ninjas-component");
    //     assert.isTrue(screen);
    // });

    const getItems = async () => { return driver.isAndroid ? await driver.findElementsByText("(Android)") : await driver.findElementsByText("(ios)"); }
});
