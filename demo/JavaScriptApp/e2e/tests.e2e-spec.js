"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const nativescript_dev_appium_1 = require("nativescript-dev-appium");
const chai_1 = require("chai");
describe("sample scenario", () => {
    let driver;
    before(() => __awaiter(this, void 0, void 0, function* () {
        driver = yield nativescript_dev_appium_1.createDriver();
    }));
    beforeEach(function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const lblPlatform = yield getPlatformLabel();
            }
            catch (err) {
                console.log("Navigating to main page ...");
                yield driver.navBack();
            }
        });
    });
    afterEach(function () {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.currentTest.state === "failed") {
                yield driver.logPageSource(this.currentTest.title);
                yield driver.logScreenshot(this.currentTest.title);
            }
        });
    });
    after(() => __awaiter(this, void 0, void 0, function* () {
        yield driver.quit();
        console.log("Quit driver!");
    }));
    it("should the button on second page work", () => __awaiter(this, void 0, void 0, function* () {
        const btnNav = yield driver.findElementByText("btnNav");
        yield btnNav.tap();
        const secondPage = yield driver.findElementByText("Second Page");
        const btnZero = yield driver.findElementByText("0");
        yield btnZero.tap();
        // In iOS, the `automationText` property applies on both `name` and `label`:
        // https://github.com/NativeScript/NativeScript/issues/3150
        // <XCUIElementTypeButton type="XCUIElementTypeButton" name="0" label="0" enabled="true" visible="true" x="132" y="395" width="111" height="110"/>
        // <XCUIElementTypeButton type="XCUIElementTypeButton" name="btn" label="btn" enabled="true" visible="true" x="132" y="395" width="111" height="110"/>
        const btnOne = yield driver.findElementByText("1");
        yield driver.navBack();
    }));
    it("should the button on main page work", () => __awaiter(this, void 0, void 0, function* () {
        const btnTap = yield driver.findElementByText("TAP");
        yield btnTap.tap();
        const lblTaps = yield driver.findElementByText("taps left", 1 /* contains */);
        const lblTapsText = yield lblTaps.text();
        chai_1.assert.isTrue(lblTapsText.includes("41"));
    }));
    const styleTypes = {
        "inline": "styleInline",
        "page": "stylePage",
        "app": "styleApp"
    };
    for (let styleType in styleTypes) {
        it(`should find an element with ${styleType} style applied`, function () {
            return __awaiter(this, void 0, void 0, function* () {
                const element = yield driver.findElementByText(styleTypes[styleType]);
                const result = yield driver.compareElement(element, "style");
                chai_1.assert.isTrue(result);
            });
        });
    }
    const getPlatformLabel = () => __awaiter(this, void 0, void 0, function* () { return driver.isAndroid ? yield driver.findElementByText("android") : yield driver.findElementByText("ios"); });
});
//# sourceMappingURL=tests.e2e-spec.js.map