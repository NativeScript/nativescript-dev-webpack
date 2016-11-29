// using: regex, capture groups, and capture group variables.
var moduleIdRegex = /moduleId:.*$/gm;

module.exports = function(source, sourcemap) {
  var newSource = source.replace(moduleIdRegex, function(match, url) {
                   return "";
  });
  return newSource;
};
