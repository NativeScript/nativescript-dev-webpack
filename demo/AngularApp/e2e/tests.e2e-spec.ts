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
            const items = await getItems();
        } catch (err) {
            try {
                const lblNinjas = await driver.findElementByText("Ninjas!");
            }
            catch (err) {
                console.log("Navigating to ninjas page ...");
                await driver.navBack();
            }
            console.log("Navigating to main page ...");
            await driver.navBack();
        }
    });

    afterEach(async function () {
        if (this.currentTest.state === "failed") {
            await driver.logPageSource(this.currentTest.title);
            await driver.logScreenshot(this.currentTest.title);
        }
    });

    after(async () => {
        await driver.quit();
        console.log("Quit driver!");
    });

    it("should navigate to a ninja", async () => {
        const btnNinjas = await driver.findElementByText("Ninjas");
        await btnNinjas.click();

        const itemMichaelangelo = await driver.findElementByText("Michaelangelo");
        await itemMichaelangelo.click();

        const lblMichaelangelo = await driver.findElementByText("Ninja Michaelangelo!");
        await lblMichaelangelo.isDisplayed();

        const btnBackToNinjas = await driver.findElementByText("Back to ninjas");
        await btnBackToNinjas.click();

        const btnGoBackHome = await driver.findElementByText("Go back home");
        await btnGoBackHome.click();
    });

    const styleTypes = {
        "inline": "styleInline",
        "page": "stylePage",
        "app": "styleApp"
    };

    for (let styleType in styleTypes) {
        it(`should find an element with ${styleType} style applied`, async function () {
            const element = await driver.findElementByText(styleTypes[styleType]);
            const result = await driver.compareElement(element, "style");
            assert.isTrue(result);
        });
    }

    const getItems = async () => { return driver.isAndroid ? await driver.findElementsByText("(Android)") : await driver.findElementsByText("(ios)"); }
});
