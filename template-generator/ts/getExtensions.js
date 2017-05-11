module.exports = `
// Resolve platform-specific modules like module.android.js
function getExtensions(platform) {
    return Object.freeze([
        \`.\${platform}.ts\`,
        \`.\${platform}.js\`,
        ".ts",
        ".js",
        ".css",
        \`.\${platform}.css\`,
    ]);
}
`;
