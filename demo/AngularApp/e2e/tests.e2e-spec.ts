import { AppiumDriver, createDriver, SearchOptions } from "nativescript-dev-appium";
import { assert } from "chai";

describe("sample scenario", async function () {
    let driver: AppiumDriver;

    before(async function () {
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
            await driver.logTestArtifacts(this.currentTest.title);
        }
    });

    after(async function () {
        await driver.quit();
        console.log("Quit driver!");
    });

    it("should navigate to a ninja", async function () {
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

    const getItems = async function () { return driver.isAndroid ? await driver.findElementsByText("(Android)") : await driver.findElementsByText("(ios)"); }
});
