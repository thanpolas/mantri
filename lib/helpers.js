
var cTools = require('grunt-closure-tools')(),
    grunt  = require('grunt');

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

/**
 * Returns all the .js files excluding dangerous directories line node_modules
 *
 * @param  {string} directory The path to the directory we want to scan.
 * @return {Array.<string>} An array of strings, the .js files.
 * @deprecated Not used, chose another path, remains in case of future neeed.
 */
helpers.getJSTargets = function ( directory ) {
  var exclude = [
    'node_modules/**',
    'deps.js'
  ];

  var expandOpts = [ directory + '/**/*.js' ];
  exclude.forEach( function( excl ) {
    expandOpts.push( '!' + directory + '/' + excl );
  });
  var output = grunt.file.expand(expandOpts);

  return output;
};

module.exports = helpers;
