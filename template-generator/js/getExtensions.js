module.exports = `
// Resolve platform-specific modules like module.android.js
function getExtensions(platform) {
    return Object.freeze([
        \`.\${platform}.js\`,
        \`.\${platform}.css\`,
        ".js",
        ".css",
    ]);
}
`;
