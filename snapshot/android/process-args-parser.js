module.exports = function parseProcessArgs() {
    var args = process.argv.slice(2);
    var result = {};
    var prevIsKey = false;
    var lastKey = "";
    args.forEach(function(value, index, array) {
        if (!prevIsKey && value.startsWith("--")) { // if is key
            prevIsKey = true;
            lastKey = value.slice(2);
        }
        else if (!prevIsKey) { // if is second... value
            if (!(result[lastKey] instanceof Array)) {
                result[lastKey] = [result[lastKey]];
            }
            result[lastKey].push(parseValue(value));
        }
        else { // if is first value
            result[lastKey] = parseValue(value);

            prevIsKey = false;
        }
    });

    return result;
}

function parseValue(value) {
    return value === "true" ? true : (value === "false" ? false : value);
}