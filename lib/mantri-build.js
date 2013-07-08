/*jshint camelcase:false */
/**
 * Build the source code
 *
 */
var fs     = require('fs');
var path   = require('path');

var fse = require('fs-extra');
var gcTools = require('grunt-closure-tools');
var grunt  = require('grunt');
var __     = require('lodash');
var Tempdir = require('temporary/lib/dir');
var gUglify = require('grunt-contrib-uglify')().uglify.init( grunt );
var cTools   = require('closure-tools');
var compiler = require('superstartup-closure-compiler');

var helpers= require('./helpers');

var build = module.exports = {
  _tmpDir: null,
  GOOG_BASE_FILE: 'base.js'
};

var noop = function(){};

/**
 * ===== THIS IS A COPY FROM lib/config/config.js =====
 *
 * The properties available via the config JSON file.
 *
 * This enum does not describe structure of the config
 * map, although it tries via intendation.
 *
 * Plainly do a static declaration of keys used.
 *
 * @enum {string}
 */
build.webConfigProps = {
  BASEURL: 'baseUrl',
  LIBS: 'libs',
  NAMESPACE: 'require',

  // the build tree
  BUILD: 'build',
  INPUT: 'input',
  DEST: 'dest'
};

// Define the path to the closure compiler jar file.
var CLOSURE_COMPILER = compiler.getPathSS();
var CLOSURE_BUILDER  = cTools.getPath('build/closurebuilder.py');
var VENDOR_BUNDLE    = 'libs.js';



/**
 * Run the build task using mantriConf.json file.
 *
 * We require the mantri configuration file that bootstraps the web.
 *
 * We expect to find there information about how to perform the build.
 *
 * After we are satisfied with what we collect we start the build process.
 *
 * The opts object expects these keys:
 *   src {string=} The path to mantriConf.json file.
 *   dest {string=} The filename to output the result.
 *   target {string=} The target we are working on, a name to identify the task.
 *
 * @param {Object} opts A map with options as defined above.
 * @param {Function} cb The callback.
 */
build.useMantriConf = function(opts, cb) {

  // Read and validate the web config file
  var confFile = (opts.src || 'mantriConf.json') + '';
  if ( !grunt.file.isFile(confFile) ) {
    helpers.log.error('No mantriConf.json file found: '.red + confFile.blue);
    cb( false );
    return;
  }

  var mantriConf = grunt.file.readJSON( confFile );
  if (!build.mantriConfValidate(mantriConf)) {
    return cb(false);
  }

  // assign known properties
  var inputFile = path.dirname(confFile) + '/' + mantriConf.build.input;
  var buildOpts = {
    src: inputFile,
    dest: (opts.dest || mantriConf.build.dest || 'app.min.js') + '',
    outputWrapper: mantriConf.build.outputWrapper || null,
    excludeVendor: mantriConf.build.exclude || [],
    documentRoot: path.dirname(confFile),
    jsRoot: path.dirname(inputFile),
    vendorRoot: path.dirname(confFile),
    vendorFiles: mantriConf.libs || null,
    target: (opts.target || '') + '',
  };

  // Check for vendor files
  if (__.isObject(buildOpts.vendorFiles)) {
    // check if baseUrl is there
    if (__.isString( mantriConf.baseUrl)) {
      buildOpts.vendorRoot = path.join(buildOpts.documentRoot, mantriConf.baseUrl);
    }
  }

  build.run(buildOpts, cb);
};

/**
 * Validate the mantriConf file.
 *
 * @param  {Object} mantriConf The mantri configuration object.
 * @return {boolean}
 */
build.mantriConfValidate = function(mantriConf) {
  if ( !__.isObject( mantriConf.build ) ) {
    helpers.log.error('There is no \'build\' key in your mantriConf file.');
    return false;
  }

  if ( !__.isString( mantriConf.build.input ) ) {
    helpers.log.error('There is no \'build.input\' key in your mantriConf file.');
    return false;
  }
  return true;
};

/**
 * Run the build operation.
 *
 * "buildOpts" Map must contain the following keys:
 *   src {string} The application bootstrap file.
 *   dest {string} The destination file.
 *   outputWrapper {string=} The output wrapper if needed.
 *   excludeVendor {Array.<string>=} Files to exclude from building.
 *   target {string=} The target we are working on, a name to identify the task.
 *   documentRoot {string} The root path of the website.
 *   vendorRoot {string=} The root path of the vendor libraries.
 *   jsRoot {string=} The root path of the JS Application.
 *   vendorFiles {Object.<string>=} Third party libraries.
 *
 * @param  {Object} buildOpts A Map of required options as defined above.
 * @param  {Function} cb The callback.
 */
build.run = function(buildOpts, cb) {
  // Sanitize Build Options
  if (!build.validate( buildOpts )) {
    // error messages sent by validate
    cb( false );
    return;
  }
  helpers.log.debug( buildOpts.debug, 'Passed Validations.');

  // prepare internal options
  var options = {};
  options.cb = cb;
  options._tmpDir      = new Tempdir();
  // override temporary rmdir method
  options._tmpDir.rmdir = __.partial(fse.remove, options._tmpDir.path, noop);

  options.googMock     = options._tmpDir.path + '/' + build.GOOG_BASE_FILE;
  options.vendorFile   = options._tmpDir.path + '/' + VENDOR_BUNDLE;
  // temporary file to save the compiled app.
  options.appMin       = options._tmpDir.path + '/appCompiled.js';


  //
  //
  // Create the temp google closure mock dir and file
  //
  //
  if ( !build._createGoogleMock( options ) ) {
    options._tmpDir.rmdir();
    cb(false);
    return;
  }

  helpers.log.debug( options.debug, 'Created temp dir and google mock: ' + options._tmpDir.path);

  //
  //
  // Resolve and bundle all third party dependencies.
  // Minify them.
  //
  //
  if (__.isObject(buildOpts.vendorFiles) && !build._bundleLibs(buildOpts, options)) {
    options._tmpDir.rmdir();
    cb(false);
    return;
  }

  helpers.log.debug( options.debug, 'Vendor libs bundled. Constructing builder command...');

  //
  //
  // Prepare the options for the closureBuilder task.
  //
  //
  var rootPath = [ buildOpts.jsRoot ];
  rootPath.push( options._tmpDir.path );
  var cToolsOptions = {
    builder: helpers.getPath( CLOSURE_BUILDER ),
    inputs: path.dirname( options.confFile ) + '/' + buildOpts.src,
    compile: true,
    compilerFile: helpers.getPath( CLOSURE_COMPILER ),
    compilerOpts: {
      compilation_level: 'SIMPLE_OPTIMIZATIONS',
      warning_level: (options.debug ? 'VERBOSE' : 'QUIET'),
      // go wild here, name every exception in the book to be ignored
      // WE BE NO SCARE HAXORShh
      jscomp_off: gcTools.closureOpts.compiler.jscomp_off
    }
  };
  var cToolsFileObj = {
    src: rootPath,
    dest: options.appMin
  };

  var command = gcTools.builder.createCommand( cToolsOptions, cToolsFileObj );

  if ( !command ) {
    helpers.log.error('Create shell command failed for builder');
    options._tmpDir.rmdir();
    cb( false );
    return;
  }

  //
  //
  // Run the command.
  //
  //
  helpers.log.debug( options.debug, 'Builder command constructed. Executing...');
  var commands = [ {cmd: command, dest: buildOpts.target} ];

  helpers.runCommands( commands, __.partial( build._finishBuild, buildOpts,
    options ), !options.debug);
};

/**
 * Last step in the build process.
 * Is the callback of the command execution.
 *
 * @param {Object} buildOpts Build options.
 * @param {Object} options The options object.
 * @param {boolean} status The status of the command execution.
 * @private
 */
build._finishBuild = function( buildOpts, options, status ) {
  if (!status) {
    options._tmpDir.rmdir();
    options.cb( status );
    return;
  }

  helpers.log.debug( options.debug, 'Compilation complete. Concatenating files...');

  // append the contents of the compiled app to the dest which now only
  // contains minified vendor files.
  var compiledApp = grunt.file.read( options.appMin );
  fs.appendFileSync( buildOpts.dest, compiledApp );
  options._tmpDir.rmdir();
  compiledApp = null;

  //
  //
  // check if there is a wrapper option
  //
  //
  if (buildOpts.outputWrapper) {
    var bundledApp = grunt.file.read( buildOpts.dest );
    // remove trailing newline
    var applen = bundledApp.length;
    if ('\n' === bundledApp.substr(applen-1)) {
      bundledApp = bundledApp.substr(0, applen-2);
    }

    var wrappedApp = __.template(buildOpts.outputWrapper)({
      output: bundledApp
    }) + '\n'; // add a trailing newline
    grunt.file.write(buildOpts.dest, wrappedApp);
    wrappedApp = bundledApp = null;
  }

  helpers.log.info('\nBuild complete!'.green + '\n\nStats for: ' + buildOpts.dest.blue);

  // generate stats
  helpers.generateStats(buildOpts.dest, options.cb);

};

/**
 * Bundles the vendor libraries into one file and minifies them.
 *
 * Currently using uglify.
 *
 * For reasons i cannot explain certain patterns of libs make the
 * closure compiler to blow up (litteraly)
 *
 * @param {Object} buildOpts The build options.
 * @param {Object} options The options object.
 * @return {boolean} success or not.
 */
build._bundleLibs = function(buildOpts, options) {

  helpers.log.debug( options.debug, 'Will resolve and bundle all vendor libraries...');

  if (!build._appendVendorLibs(buildOpts, options)) {
    return false;
  }

  helpers.log.debug( options.debug, 'Will now minify the vendor libs to dest: ' +
    buildOpts.dest.blue);

  // minify the libs using uglify.
  if ( !build.minify( options.vendorFile, buildOpts.dest ) ) {
    helpers.log.warn( 'Uglification of vendor libs failed');
    return false;
  }

  return true;
};

/**
 * [minify description]
 * @return {[type]} [description]
 */
build.minify = function(src, dest) {
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

/**
 * Will resolve all third party dependencies and concatenate them at the end
 * of the goog base file mock.
 *
 * @param {Object} buildOpts the build options.
 * @param {Object} options The options object.
 * @return {boolean} operation success or fail.
 */
build._appendVendorLibs = function(buildOpts, options ) {

  //
  // Go through all the vendor dependencies and create an
  // array of proper paths.
  //
  var vendorFile; // string, the current vendor file.
  var fileSrc = '';

  helpers.log.debug( options.debug, 'Starting itterating on vendor libs');

  // initialize the file
  grunt.file.write( options.vendorFile, '' );

  __.forOwn(buildOpts.vendorFiles, function(libName, libKey){
    if ( 0 <= buildOpts.excludeVendor.indexOf(libKey)) {
      return;
    }

    vendorFile = buildOpts.vendorRoot + libName + '.js';

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

/**
 * Validate the build options passed.
 *
 * @param  {Object} buildOpts The build options to validate.
 * @return {boolean} yes / no.
 */
build.validate = function( buildOpts ) {
  if ( !buildOpts.dest ) {
    helpers.log.error('No output file defined! Use the "dest" option.'.red);
    return false ;
  }

  return true;
};
