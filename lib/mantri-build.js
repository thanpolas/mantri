/*jshint camelcase:false */
/**
 * Build the source code
 *
 */
var fs     = require('fs');

var fse = require('fs-extra');
var grunt  = require('grunt');
var __     = require('lodash');
var Tempdir = require('temporary/lib/dir');

var valid = require('./mantri-build-validate');
var mantriCompile = require('./mantri-build-compile');
var buildMods = require('./mantri-build-module');
var buildVendors = require('./mantri-build-vendor');

var helpers= require('./helpers');

var build = module.exports = {
  _tmpDir: null,
  GOOG_BASE_FILE: 'base.js'
};

var noop = function(){};

/** @const {string} define the temp name where vendor libs will be stored */
var VENDOR_BUNDLE    = 'libs.js';

/**
 * Run the build operation.
 *
 * @param  {Object} buildOpts A Map of required options as defined bellow.
 *   @param {string} src The application bootstrap file.
 *   @param {string} dest The destination file.
 *   @param {string} documentRoot The root path of the website.
 *   @param {string} mantriConf The mantriConf location.
 *   @param {string=} outputWrapper The output wrapper if needed.
 *   @param {Array.<string>=} excludeVendor Files to exclude from building.
 *   @param {string=} target The target we are working on, a name to identify the task.
 *   @param {string=} jsRoot The root path of the JS Application.
 *   @param {Object.<string>=} vendorLibs Third party libraries.
 *   @param {boolean=} noVendorLibs Set to true to not build vendor libraries.
 *   @param {boolean=} _noCompile experimental no compilation flag.
 * @param  {Function(Error=)} cb The callback.
 */
build.run = function(buildOpts, cb) {
  // Sanitize Build Options
  if (!valid.validate( buildOpts )) {
    // error messages sent by validate
    cb(new Error('Validation Error'));
    return;
  }
  helpers.log.debug( buildOpts.debug, 'Passed Validations.');

  // prepare internal options
  // TODO *fugly*
  var options = {};
  options.noCompile = buildOpts._noCompile === true;
  options.debug = buildOpts.debug;
  options.cb = cb;
  options._tmpDir      = new Tempdir();
  // override temporary rmdir method
  options._tmpDir.rmdir = __.partial(fse.remove, options._tmpDir.path, noop);

  options.googMock     = options._tmpDir.path + '/' + build.GOOG_BASE_FILE;
  options.vendorFile   = options._tmpDir.path + '/' + VENDOR_BUNDLE;
  // temporary file to save the compiled app.
  options.tempCompiledDest       = options._tmpDir.path + '/appCompiled.js';

  //
  //
  // Create the temp google closure mock dir and file
  //
  //
  if ( !build._createGoogleMock( options ) ) {
    options._tmpDir.rmdir();
    cb(new Error());
    return;
  }

  helpers.log.debug( options.debug, 'Created temp dir and google mock: ' + options._tmpDir.path);

  //
  //
  // Resolve and bundle all third party dependencies.
  // Minify them.
  //
  //
  if (!buildOpts.noVendorLibs && __.isObject(buildOpts.vendorLibs)) {
    if (!buildVendors.bundleLibs(buildOpts, options)) {
      options._tmpDir.rmdir();
      cb(new Error());
      return;
    }
  }

  helpers.log.debug( options.debug, 'Vendor libs bundled. Constructing builder command...');

  var compileOpts = {
    jsRoot: buildOpts.jsRoot,
    gmockDir: options._tmpDir,
    src: buildOpts.src,
    dest: options.tempCompiledDest,
    target: buildOpts.target,
    debug: options.debug,
    outputWrapper: buildOpts.outputWrapper,
    noCompile: options.noCompile,
  };

  // first perform the default, main compile
  mantriCompile.compile(compileOpts, function(status) {
    if (!status) {
      options._tmpDir.rmdir();
      cb(new Error());
      return;
    }

    //
    //
    // Now build any modules
    //
    //
    buildMods.buildModules(buildOpts, options,
      build._finishBuild.bind(null, buildOpts, options));
  });
};


/**
 * Last step in the build process.
 *
 * @param {Object} buildOpts Build options.
 * @param {Object} options The options object.
 * @param {Error=} err The status of the command execution.
 * @private
 */
build._finishBuild = function( buildOpts, options, err ) {
  if (err) {
    options._tmpDir.rmdir();
    options.cb( true );
    return;
  }

  helpers.log.debug( options.debug, 'Compilation complete. Appending "' +
    options.tempCompiledDest + '" to "' + buildOpts.dest + '"');

  // append the contents of the compiled app to the dest which now only
  // contains minified vendor files.
  var compiledApp = grunt.file.read( options.tempCompiledDest );
  fs.appendFileSync( buildOpts.dest, compiledApp );
  options._tmpDir.rmdir();
  compiledApp = null;

  helpers.log.info('\nBuild complete!'.green + '\n\nStats for: ' + buildOpts.dest.blue);

  // generate stats
  helpers.generateStats(buildOpts.dest, options.cb);

};

/**
 * Create the temp google closure mock dir and file.
 *
 * @param  {Object} options The options object.
 * @return {boolean} success or fail.
 */
build._createGoogleMock = function( options ) {
  // write the mock goog base file in the temp dir.
  var contents = 'var goog = goog || {}; // Identifies this file as the Closure base.\n';
  grunt.file.write( options.googMock , contents) ;

  return true;
};
