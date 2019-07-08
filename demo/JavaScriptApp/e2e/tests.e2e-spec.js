"use strict";
const nsAppium = require("nativescript-dev-appium");
const chai = require("chai");

describe("sample scenario", function () {
    let driver;
    before((async function () {
        nsAppium.nsCapabilities.testReporter.context = this;
        driver = await nsAppium.createDriver();
    }));

    afterEach(async function () {
        if (this.currentTest.state === "failed") {
            await driver.logTestArtifacts(this.currentTest.title);
        }
    });

    it("should the button on second page work", async function () {
        const btnNav = await driver.findElementByText("btnNav");
        await btnNav.tap();
        const secondPage = await driver.findElementByText("Second Page");
        const btnZero = await driver.findElementByText("0");
        await btnZero.tap();
        const btnOne = await driver.findElementByText("1");
        await driver.navBack();
    });

    it("should the button on main page work", async function () {
        const btnTap = await driver.findElementByText("TAP");
        await btnTap.tap();
        const lblTaps = await driver.findElementByText("taps left", 1 /* contains */);
        const lblTapsText = await lblTaps.text();
        chai.assert.isTrue(lblTapsText.includes("41"));
    });

    const styleTypes = {
        "inline": "styleInline",
        "page": "stylePage",
        "app": "styleApp"
    };
    for (let index = 0; index < styleTypes.length; index++) {
        const styleType = array[index];

        it(`should find an element with ${styleType} style applied`, async function () {
            const element = await driver.findElementByText(styleTypes[styleType]);
            driver.imageHelper.options.keepOriginalImageSize = false;
            driver.imageHelper.options.isDeviceSpecific = false;
            const result = await driver.compareElement(element, "style");
            assert.isTrue(result);
        });
    }
});