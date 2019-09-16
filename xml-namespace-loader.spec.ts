import xmlNsLoader from "./xml-namespace-loader";

const CODE_FILE = `
<Page xmlns="http://www.nativescript.org/tns.xsd">
    <StackLayout>
        <GridLayout xmlns:chart="nativescript-ui-chart">
            <chart:RadCartesianChart></chart:RadCartesianChart>
        </GridLayout>
        <GridLayout xmlns:chart="nativescript-ui-chart">
            <chart:RadCartesianChart></chart:RadCartesianChart>
        </GridLayout>
    </StackLayout>
</Page>
`;

interface TestSetup {
    resolveMap: { [path: string]: string },
    expectedDeps: string[],
    expectedRegs: { name: string, path: string }[],
    ignore?: RegExp,
    assureNoDeps?: boolean;
}

function getContext(
    done: DoneFn,
    { resolveMap, expectedDeps, expectedRegs, assureNoDeps, ignore }: TestSetup) {
    const actualDeps: string[] = [];

    const loaderContext = {
        rootContext: "app",
        context: "app/component",
        async: () => (error, source: string) => {
            expectedDeps.forEach(expectedDep => expect(actualDeps).toContain(expectedDep));

            expectedRegs.forEach(({ name, path }) => {
                const regCode = `global.registerModule("${name}", function() { return require("${path}"); });`;
                expect(source).toContain(regCode);
            })

            if (assureNoDeps) {
                expect(actualDeps.length).toBe(0);
                expect(source).not.toContain("global.registerModule");
            }

            done();
        },
        resolve: (context: string, request: string, callback: (err: Error, result: string) => void) => {
            // console.log(`Resolve request: ${request}, result: ${resolveMap[request]}`);
            if (resolveMap[request]) {
                callback(undefined, resolveMap[request]);
            } else {
                callback(new Error(`Module ${request} not found`), undefined);
            }
        },
        addDependency: (dep: string) => {
            actualDeps.push(dep);
        },
        query: { ignore }
    }

    return loaderContext;
}

fdescribe("XmlNamespaceLoader", () => {
    it("with namespace pointing to files", (done) => {
        const resolveMap = {
            "app/nativescript-ui-chart": "app/nativescript-ui-chart.js",
            "app/nativescript-ui-chart.xml": "app/nativescript-ui-chart.xml",
            "app/nativescript-ui-chart.css": "app/nativescript-ui-chart.css",
        };

        const expectedDeps = [
            "app/nativescript-ui-chart.js",
            "app/nativescript-ui-chart.xml",
            "app/nativescript-ui-chart.css",
        ];

        const expectedRegs = [
            { name: "nativescript-ui-chart", path: "app/nativescript-ui-chart.js" },
            { name: "nativescript-ui-chart/RadCartesianChart", path: "app/nativescript-ui-chart.js" },
            { name: "nativescript-ui-chart/RadCartesianChart.xml", path: "app/nativescript-ui-chart.xml" },
            { name: "nativescript-ui-chart/RadCartesianChart.css", path: "app/nativescript-ui-chart.css" },
        ];

        const loaderContext = getContext(done, { resolveMap, expectedDeps, expectedRegs });

        xmlNsLoader.call(loaderContext, CODE_FILE);
    })

    it("with namespace/elementName pointing to files (with package.json)", (done) => {
        const resolveMap = {
            "app/nativescript-ui-chart": "app/nativescript-ui-chart/RadCartesianChart.js", //simulate package.json
            "app/nativescript-ui-chart/RadCartesianChart": "app/nativescript-ui-chart/RadCartesianChart.js",
            "app/nativescript-ui-chart/RadCartesianChart.xml": "app/nativescript-ui-chart/RadCartesianChart.xml",
            "app/nativescript-ui-chart/RadCartesianChart.css": "app/nativescript-ui-chart/RadCartesianChart.css",
        }

        const expectedDeps = [
            "app/nativescript-ui-chart/RadCartesianChart.js",
            "app/nativescript-ui-chart/RadCartesianChart.xml",
            "app/nativescript-ui-chart/RadCartesianChart.css",
        ];

        const expectedRegs = [
            { name: "nativescript-ui-chart", path: "app/nativescript-ui-chart/RadCartesianChart.js" },
            { name: "nativescript-ui-chart/RadCartesianChart", path: "app/nativescript-ui-chart/RadCartesianChart.js" },
            { name: "nativescript-ui-chart/RadCartesianChart.xml", path: "app/nativescript-ui-chart/RadCartesianChart.xml" },
            { name: "nativescript-ui-chart/RadCartesianChart.css", path: "app/nativescript-ui-chart/RadCartesianChart.css" },
        ];

        const loaderContext = getContext(done, { resolveMap, expectedDeps, expectedRegs });
        xmlNsLoader.call(loaderContext, CODE_FILE);
    })

    it("with namespace/elementName pointing to files", (done) => {
        const resolveMap = {
            "app/nativescript-ui-chart/RadCartesianChart": "app/nativescript-ui-chart/RadCartesianChart.js",
            "app/nativescript-ui-chart/RadCartesianChart.xml": "app/nativescript-ui-chart/RadCartesianChart.xml",
            "app/nativescript-ui-chart/RadCartesianChart.css": "app/nativescript-ui-chart/RadCartesianChart.css",
        }

        const expectedDeps = [
            "app/nativescript-ui-chart/RadCartesianChart.js",
            "app/nativescript-ui-chart/RadCartesianChart.xml",
            "app/nativescript-ui-chart/RadCartesianChart.css",
        ];

        const expectedRegs = [
            { name: "nativescript-ui-chart", path: "app/nativescript-ui-chart/RadCartesianChart.js" },
            { name: "nativescript-ui-chart/RadCartesianChart", path: "app/nativescript-ui-chart/RadCartesianChart.js" },
            { name: "nativescript-ui-chart/RadCartesianChart.xml", path: "app/nativescript-ui-chart/RadCartesianChart.xml" },
            { name: "nativescript-ui-chart/RadCartesianChart.css", path: "app/nativescript-ui-chart/RadCartesianChart.css" },
        ];

        const loaderContext = getContext(done, { resolveMap, expectedDeps, expectedRegs });
        xmlNsLoader.call(loaderContext, CODE_FILE);
    })

    it("with namespace/elementName pointing to files - only XML and CSS", (done) => {
        const resolveMap = {
            "app/nativescript-ui-chart/RadCartesianChart.xml": "app/nativescript-ui-chart/RadCartesianChart.xml",
            "app/nativescript-ui-chart/RadCartesianChart.css": "app/nativescript-ui-chart/RadCartesianChart.css",
        }

        const expectedDeps = [
            "app/nativescript-ui-chart/RadCartesianChart.xml",
            "app/nativescript-ui-chart/RadCartesianChart.css",
        ];

        const expectedRegs = [
            { name: "nativescript-ui-chart/RadCartesianChart.xml", path: "app/nativescript-ui-chart/RadCartesianChart.xml" },
            { name: "nativescript-ui-chart/RadCartesianChart.css", path: "app/nativescript-ui-chart/RadCartesianChart.css" },
        ];

        const loaderContext = getContext(done, { resolveMap, expectedDeps, expectedRegs });
        xmlNsLoader.call(loaderContext, CODE_FILE);
    })

    it("with plugin path", (done) => {
        const resolveMap = {
            "nativescript-ui-chart": "node_module/nativescript-ui-chart/ui-chart.js",
        }

        const expectedDeps = [
        ];

        const expectedRegs = [
            { name: "nativescript-ui-chart", path: "nativescript-ui-chart" },
            { name: "nativescript-ui-chart/RadCartesianChart", path: "nativescript-ui-chart" },
        ];

        const loaderContext = getContext(done, { resolveMap, expectedDeps, expectedRegs });
        xmlNsLoader.call(loaderContext, CODE_FILE);
    })

    it("with plugin path", (done) => {
        const resolveMap = {
            "nativescript-ui-chart": "node_module/nativescript-ui-chart/ui-chart.js",
        }

        const expectedDeps = [
        ];

        const expectedRegs = [
            { name: "nativescript-ui-chart", path: "nativescript-ui-chart" },
            { name: "nativescript-ui-chart/RadCartesianChart", path: "nativescript-ui-chart" },
        ];

        const loaderContext = getContext(done, { resolveMap, expectedDeps, expectedRegs });
        xmlNsLoader.call(loaderContext, CODE_FILE);
    })

    it("with ignored namespace should not add deps or register calls", (done) => {
        const resolveMap = {
            "app/nativescript-ui-chart": "app/nativescript-ui-chart.js",
            "app/nativescript-ui-chart.xml": "app/nativescript-ui-chart.xml",
            "app/nativescript-ui-chart.css": "app/nativescript-ui-chart.css",
        };
        const expectedDeps = [];
        const expectedRegs = [];

        const loaderContext = getContext(done, { resolveMap, expectedDeps, expectedRegs, ignore: /nativescript\-ui\-chart/, assureNoDeps: true });

        xmlNsLoader.call(loaderContext, CODE_FILE);
    })
});
