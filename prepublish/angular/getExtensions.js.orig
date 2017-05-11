module.exports = `
// Resolve platform-specific modules like module.android.js
function getExtensions(platform) {
    return Object.freeze([
        \`.\${platform}.ts\`,
        \`.\${platform}.js\`,
        ".aot.ts",
        ".ts",
        ".js",
        ".css",
        \`.\${platform}.css\`,
    ]);
}
`;
