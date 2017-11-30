import { AppiumDriver, createDriver, SearchOptions } from "nativescript-dev-appium";
import { assert } from "chai";

describe("sample scenario", () => {
    const defaultWaitTime = 5000;
    let driver: AppiumDriver;

    before(async () => {
        driver = await createDriver();
    });

    beforeEach(async function () {
        try {
            const lblPlatform = await getPlatformLabel();
        } catch (err) {
            console.log("Navigating to main page ...");
            await driver.navBack();
        }
    });

    afterEach(async function () {
        if (this.currentTest.state === "failed") {
            await driver.logScreenshot(this.currentTest.title);
        }
    });

    after(async () => {
        await driver.quit();
        console.log("Quit driver!");
    });

    it("should the button on second page work", async () => {
        const btnNav = await driver.findElementByText("btnNav");
        await btnNav.tap();

        const secondPage = await driver.findElementByText("Second Page");
        const btn = await driver.findElementByText("btn");

        const result = await driver.compareElement(btn, getButtonImageName());
        assert.isTrue(result);

        await btn.tap();
        assert.equal(await btn.text(), 1);

        await driver.navBack();
    });

    it("should the button on main page work", async () => {
        const btnTap = await driver.findElementByText("TAP");
        await btnTap.tap();

        const lblTaps = await driver.findElementByText("taps left", SearchOptions.contains);
        const lblTapsText = await lblTaps.text();
        assert.isTrue(lblTapsText.includes("41"));
    });

    const styleTypes = {
        "inline": "styleInline",
        "page": "stylePage",
        "app": "styleApp"
    };

    for (let styleType in styleTypes) {
        it(`should find an element with ${styleType} style applied`, async function () {
            const element = await driver.findElementByText(styleTypes[styleType]);
            const result = await driver.compareElement(element, getPlatformImageName());
            assert.isTrue(result);
        });
    }

    const getButtonImageName = () => { return driver.isAndroid ? "btnAndroid" : "btnIOS"; }
    const getPlatformImageName = () => { return driver.isAndroid ? "styleAndroid" : "styleIOS"; }
    const getPlatformLabel = async () => { return driver.isAndroid ? await driver.findElementByText("android") : await driver.findElementByText("ios"); }
});