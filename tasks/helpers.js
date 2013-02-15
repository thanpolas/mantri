
var cTools = require('grunt-closure-tools')();

var helpers = cTools.helpers;

/**
 * Reoslve our cwd and prepend proper path to provided filepath.
 *
 * @param  {string} filePath Any string.
 * @return {string} properly prefixed path.
 */
helpers.getPath = function( filePath ) {
  return __dirname + '/../' +  filePath;
};

module.exports = helpers;
