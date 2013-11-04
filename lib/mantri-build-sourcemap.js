/*jshint camelcase:false */
/**
 * @fileOverview The Sourcemaps part of the build operation.
 */
var fs = require('fs');

var grunt  = require('grunt');

// var helpers= require('./helpers');

var sourcemap = module.exports = {};

/**
 * Append the sourcemap snippet to the compiled file.
 * 
 * @param  {Object} compileOpts Compiler opts as defined in mantri-build-compile.
 */
sourcemap.appendSnippet = function(compileOpts) {
  var appendSnippet = '\n//# sourceMappingURL=';
  appendSnippet += (compileOpts.sourceMappingURL || compileOpts.sourceMapFile);
  appendSnippet += '\n';
  fs.appendFileSync(compileOpts.dest, appendSnippet);
};

/**
 * Fix path sources until closure compiler supports "sourceRoot" option.
 * 
 * @see https://code.google.com/p/closure-compiler/issues/detail?id=770
 * @param  {Object} compileOpts Compiler opts as defined in mantri-build-compile.
 */
sourcemap.fixSourcemapFile = function(compileOpts) {
  // var sourceMap = grunt.file.readJSON( compileOpts.sourceMapFile );

  // skip for now, use lame symlink.
};

/**
 * Update the SourceMap so it works when .js file is concatenated with vendor libs.
 *
 * @param {Object} buildOpts The build options.
 * @param {number} newlines how many newlines the vendor libs are.
 * @deprecated not used, let it be.
 */
sourcemap.update = function(buildOpts, newlines) {
  var sourceFileContents = grunt.file.read(buildOpts.sourceMapFile);

  var tab = '  ';

  var newContent = '{\n' +
    tab + 'version: 3,\n' +
    tab + 'file: "",\n' +
    tab + 'sections: [{\n' +
    tab + tab + 'offset: {line:' + newlines + ', column:0}, map:' +
    sourceFileContents.replace(/\n/g, '\n' + tab + tab + tab) +
    '\n' + tab + '}\n]\n}';

  grunt.file.write(buildOpts.sourceMapFile, newContent);
};