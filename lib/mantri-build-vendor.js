/**
 * @fileOverview The vendors part of the build operation.
 */

var fs     = require('fs');
var grunt  = require('grunt');
var __     = require('lodash');
var gUglify = require('grunt-contrib-uglify')().uglify.init( grunt );

var helpers= require('./helpers');

var vendorLibs = module.exports = {};

/**
 * Bundles the vendor libraries into one file and minifies them.
 *
 * Currently using uglify.
 *
 * For unknown reasons certain patterns of libs make
 * closure compiler to blow up (litteraly)
 *
 * @param {Object} buildOpts The build options.
 * @param {Object} options The options object.
 * @return {boolean} success or not.
 */
vendorLibs.bundleLibs = function(buildOpts, options) {

  helpers.log.debug( options.debug, 'Will resolve and bundle all vendor' +
  ' libraries. noCompile flag:' + options.noCompile);

  if (!vendorLibs._appendVendorLibs(buildOpts, options)) {
    return false;
  }

  if (!options.noCompile) {
    helpers.log.debug( options.debug, 'Will now minify the vendor libs to dest: ' +
      buildOpts.dest.blue);

    // minify the libs using uglify.
    if ( !vendorLibs.minify( options.vendorFile, buildOpts.dest ) ) {
      helpers.log.warn( 'Uglification of vendor libs failed');
      return false;
    }
  }
  return true;
};

/**
 * Minify a file.
 *
 * @param {string} src Sourcefile.
 * @param {string} dest destination.
 * @return {boolean} operation status.
 */
vendorLibs.minify = function(src, dest) {
  var uglifyOpts = {
    banner: '',
    compress: {
      warnings: false
    },
    mangle: {},
    beautify: false
  };

  // Minify files, warn and fail on error.
  var result;
  try {
    result = gUglify.minify([ src ], dest, uglifyOpts);
  } catch (e) {
    return false;
  }

  grunt.file.write( dest, result.min );

  return true;
};



/**
 * Will resolve all third party dependencies and concatenate them at the end
 * of the goog base file mock.
 *
 * @param {Object} buildOpts the build options.
 * @param {Object} options The options object.
 * @return {boolean} operation success or fail.
 */
vendorLibs._appendVendorLibs = function(buildOpts, options ) {

  //
  // Go through all the vendor dependencies and create an
  // array of proper paths.
  //
  var vendorFile; // string, the current vendor file.
  var fileSrc = '';

  helpers.log.debug( options.debug, 'Starting itterating on vendor libs');

  // initialize the file
  grunt.file.write( options.vendorFile, '' );

  __.forOwn(buildOpts.vendorLibs, function(libName, libKey){
    if ( 0 <= buildOpts.excludeVendor.indexOf(libKey)) {
      return;
    }

    vendorFile = buildOpts.jsRoot + libName + '.js';

    if ( !grunt.file.isFile( vendorFile ) ) {
      helpers.log.warn('Could not find third party library: ' + vendorFile.red);
      return;
    }

    fileSrc = grunt.file.read( vendorFile );
    helpers.log.debug( options.debug, 'Appending vendor lib: ' + libKey +
      ' :: ' + fileSrc.length + ' :: ' + vendorFile);

    fs.appendFileSync( options.vendorFile, fileSrc );
  });

  return true;
};
