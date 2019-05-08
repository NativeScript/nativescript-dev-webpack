const nsAppium = require("nativescript-dev-appium");
const addContext = require('mochawesome/addContext');

const testReporterContext = {};
testReporterContext.name = "mochawesome";
testReporterContext.reportDir = "mochawesome-report";
testReporterContext.log = addContext;
testReporterContext.logImageTypes = [nsAppium.LogImageType.screenshots];
nsAppium.nsCapabilities.testReporter = testReporterContext;

before("start server", async function () {
    nsAppium.nsCapabilities.testReporter.context = this;
    await nsAppium.startServer();
});

after("stop appium server", async function () {
    nsAppium.nsCapabilities.testReporter.context = this;
    await nsAppium.stopServer();
});
