import { AppiumDriver, createDriver, SearchOptions, nsCapabilities } from "nativescript-dev-appium";
import { assert } from "chai";

describe("sample scenario", () => {
    let driver: AppiumDriver;

    before(async function () {
        nsCapabilities.testReporter.context = this;
        driver = await createDriver();
    });

    afterEach(async function () {
        if (this.currentTest.state === "failed") {
            await driver.logTestArtifacts(this.currentTest.title);
        }
    });

    after(async function () {
        await driver.quit();
        console.log("Quit driver!");
    });

    it("should the button on second page work", async function () {
        const btnNav = await driver.findElementByText("btnNav");
        await btnNav.tap();
        const secondPage = await driver.findElementByText("Second Page");
        const btnZero = await driver.findElementByText("0");
        await btnZero.tap();

        // In iOS, the `automationText` property applies on both `name` and `label`:
        // https://github.com/NativeScript/NativeScript/issues/3150
        // <XCUIElementTypeButton type="XCUIElementTypeButton" name="0" label="0" enabled="true" visible="true" x="132" y="395" width="111" height="110"/>
        // <XCUIElementTypeButton type="XCUIElementTypeButton" name="btn" label="btn" enabled="true" visible="true" x="132" y="395" width="111" height="110"/>
        const btnOne = await driver.findElementByText("1");
        await driver.navBack();
    });

    it("should the button on main page work", async function () {
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
            driver.imageHelper.options.keepOriginalImageSize = false;
            driver.imageHelper.options.isDeviceSpecific = false;
            const result = await driver.compareElement(element, "style");
            assert.isTrue(result);
        });
    }
});