import css2jsonLoader from "./css2json-loader";

const importTestCases = [
    `@import url("custom.css");`,
    `@import url('custom.css');`,
    `@import url('custom.css') print;`,
    `@import url("custom.css") print;`,
    `@import url('custom.css') screen and (orientation:landscape);`,
    `@import url("custom.css") screen and (orientation:landscape);`,
    `@import 'custom.css';`,
    `@import "custom.css";`,
    `@import 'custom.css' screen;`,
    `@import "custom.css" screen;`,
    `@import url(custom.css);`,
]

const someCSS = `
.btn {
    background-color: #7f9
}
`

describe("css2jsonLoader", () => {
    importTestCases.forEach((importTestCase) => {

        it(`handles: ${importTestCase}`, (done) => {

            const loaderContext = {
                callback: (error, source: string, map) => {
                    expect(source).toContain("global.registerModule(\"custom.css\", () => require(\"custom.css\"))");
                    expect(source).toContain(`{"type":"declaration","property":"background-color","value":"#7f9"}`);

                    done();
                }
            }

            css2jsonLoader.call(loaderContext, importTestCase + someCSS);
        })
    })
});
