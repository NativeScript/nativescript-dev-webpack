/*!**********************************************************!*\
  !*** ../android-snapshot-bundle-preamble.js ***!
  \**********************************************************/
var global = Function('return this')(); global.global = global; // Mock global object
// Set the __snapshot flag to true
Object.defineProperty(global, "__snapshot", {
    value: true,
    writable: false,
    configurable: false,
    enumerable: false
});
