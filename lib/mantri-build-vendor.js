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
 * @param {string} src Source file path.
 * @param {string} dest destination file path.
 * @return {boolean} operation status.
 */
vendorLibs.minify = function(src, dest) {
  // var uglifyOpts = {};
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
 * Will resolve all third party dependencies and return an array of 
 * vendor filenames that should be included in the bundle.
 *
 * @param {Object} buildOpts the build options.
 * @param {Object} options The options object.
 * @return {Array.<string>} All vendor libs that need to be bundled.
 */
vendorLibs.getVendorLibs = function(buildOpts, options ) {

  //
  // Go through all the vendor dependencies and create an
  // array of proper paths.
  //
  var vendorFile; // string, the current vendor file.
  var vendorFiles = [];

  helpers.log.debug( options.debug, 'Starting itterating on vendor libs...');

  __.forOwn(buildOpts.vendorLibs, function(libName, libKey){
    if ( 0 <= buildOpts.excludeVendor.indexOf(libKey)) {
      return;
    }

    vendorFile = buildOpts.jsRoot + libName + '.js';

    if ( !grunt.file.isFile( vendorFile ) ) {
      helpers.log.warn('Could not find third party library: ' + vendorFile.red);
      return;
    }

    vendorFiles.push(vendorFile);
  });

  return vendorFiles;
};