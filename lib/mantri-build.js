/*jshint camelcase:false */
/**
 * Build the source code
 *
 */

var gcTools = require('grunt-closure-tools'),
    helpers= require('./helpers'),
    grunt  = require('grunt'),
    __     = require('underscore'),
    path   = require('path'),
    Tempdir = require('temporary/lib/dir'),
    gUglify = require('grunt-contrib-uglify')().uglify.init( grunt ),
    fs     = require('fs'),
    cTools   = require('closure-tools'),
    compiler = require('superstartup-closure-compiler');
// define the namespace we'll work on
var build = {
  _tmpDir: null,
  GOOG_BASE_FILE: 'base.js'

};


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
var CLOSURE_COMPILER = compiler.getPathSS(),
    CLOSURE_BUILDER  = cTools.getPath('build/closurebuilder.py'),
    VENDOR_BUNDLE    = 'libs.js';



/**
 * Run the build task.
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
 * @param  {Object}   opts A map with options as defined above.
 * @param  {Function} cb      [description]
 */
build.run = function( opts, cb) {

  // bundle and sanitize all options
  var options = {
    dest: '',
    confFile: (opts.src || 'mantriConf.json') + '',
    target: (opts.target || '') + '',
    cb: cb,
    webConfig: {}
  };

  //
  //
  // Read and validate the web config file
  //
  //
  // require the config file. Flow continues at start() function.
  if ( !grunt.file.isFile(options.confFile) ) {
    helpers.log.error('No mantriConf.json file found: '.red +
      options.confFile.blue);
    cb( false );
    return;
  }

  options.webConfig = grunt.file.readJSON( options.confFile );
  options.dest = (opts.dest || options.webConfig.build.dest || 'app.min.js') + '';
  if ( !options.dest ) {
    helpers.log.error('No output file defined! Use the "dest" option.'.red);
    cb( false );
    return;
  }

  if (! build.validate( options )) {
    // error messages sent by validate
    cb( false );
    return;
  }
  helpers.log.debug( options.debug, 'Passe Validations.');

  // Define debug mode
  options.debug = !!opts.debug;

  // create new temp dir and prep google mock.
  options._tmpDir      = new Tempdir();
  options.googMock     = options._tmpDir.path + '/' + build.GOOG_BASE_FILE;
  options.vendorFile   = options._tmpDir.path + '/' + VENDOR_BUNDLE;
  // temporary file to save the compiled app.
  options.appMin       = options._tmpDir.path + '/appCompiled.js';
  options.jsDirFrag    = path.dirname( options.webConfig.build.input );
  options.documentRoot = path.dirname( options.confFile );
  // resolve what the source and dest will be for the builder
  options.jsRoot       = path.join( options.documentRoot, options.jsDirFrag );


  //
  //
  // Create the temp google closure mock dir and file
  //
  //
  if ( !build._createGoogleMock( options ) ) {
    options._tmpDir.rmdir();
    cb( false );
    return;
  }

  helpers.log.debug( options.debug, 'Created temp dir and google mock: ' + options._tmpDir.path);

  //
  //
  // Resolve and bundle all third party dependencies.
  // Minify them.
  //
  //
  if ( !build._bundleLibs( options, options.dest ) ) {
    options._tmpDir.rmdir();
    cb ( false );
    return;
  }

  helpers.log.debug( options.debug, 'Vendor libs bundled. Constructing builder command...');

  //
  //
  // Prepare the options for the closureBuilder task.
  //
  //
  var src = [ options.jsRoot ];
  src.push( options._tmpDir.path );
  var cToolsOptions = {
    builder: helpers.getPath( CLOSURE_BUILDER ),
    inputs: path.dirname( options.confFile ) + '/' + options.webConfig.build.input,
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
    src: src,
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
  var commands = [ {cmd: command, dest: options.target} ];

  helpers.runCommands( commands, __.partial( build._finishBuild, options ), !options.debug);
};

/**
 * Last step in the build process.
 * Is the callback of the command execution.
 *
 * @param  {Object} options The options object.
 * @param  {boolean} status The status of the command execution.
 * @private
 */
build._finishBuild = function( options, status ) {
  if ( !status ) {
    options._tmpDir.rmdir();
    options.cb( status );
    return;
  }

  helpers.log.debug( options.debug, 'Compilation complete. Concatenating files...');

  var compiledApp = grunt.file.read( options.appMin );
  fs.appendFileSync( options.dest, compiledApp );
  options._tmpDir.rmdir();

  // generate stats
  helpers.generateStats(options.dest, options.cb);
};

/**
 * Bundles the vendor libraries into one file and minifies them.
 *
 * Currently using uglify.
 *
 * For reasons i cannot explain certain patterns of libs make the
 * closure compiler to blow up (litteraly)
 *
 * @param  {Object} options The options object.
 * @param {string} dest The dest file of the operation.
 * @return {boolean} success or not.
 */
build._bundleLibs = function( options, dest ) {

  helpers.log.debug( options.debug, 'Will resolve and bundle all vendor libraries...');

  if ( !build._appendVendorLibs( options ) ) {
    options._tmpDir.rmdir();
    options.cb ( false );
    return;
  }


  helpers.log.debug( options.debug, 'Will now minify the vendor libs to dest: ' + dest.blue);
  // minify the libs using uglify.
  if ( !build.minify( options.vendorFile, dest ) ) {
    helpers.log.warn( 'Uglification of vendor libs failed');
    options.cb( false );
    return;
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
 * @param  {Object} options The options object
 * @return {boolean} operation success or fail.
 */
build._appendVendorLibs = function( options ) {
  var webConfig = options.webConfig;

  // shortcut assign libs namespace
  var libs = build.webConfigProps.LIBS;

  if ( !__.isObject( webConfig[libs] ) ) {
    return true;
  }

  var vendorRoot = options.documentRoot;

  // check if baseUrl is there
  if ( __.isString( webConfig.baseUrl ) ) {
    vendorRoot = path.join( vendorRoot, webConfig.baseUrl );
  }

  //
  // Go through all the vendor dependencies and create an
  // array of proper paths.
  //
  var exclude = webConfig.build.exclude || [],
      vendorFile, // string, the current vendor file.
      fileSrc = '';

  helpers.log.debug( options.debug, 'Starting itterating on vendor libs');

  // initialize the file
  grunt.file.write( options.vendorFile, '' );

  for ( var lib in webConfig[libs] ) {
    if ( 0 <= exclude.indexOf( lib ) ) {
      continue;
    }

    vendorFile = vendorRoot + webConfig[libs][lib] + '.js';

    if ( !grunt.file.isFile( vendorFile ) ) {
      helpers.log.error('Could not find third party library: ' + vendorFile.red);
      return false;
    }

    fileSrc = grunt.file.read( vendorFile );
    helpers.log.debug( options.debug, 'Appending vendor lib: ' + lib +
      ' :: ' + fileSrc.length + ' :: ' + vendorFile);

    fs.appendFileSync( options.vendorFile, fileSrc );
  }

  return true;
};

/**
 * Validate the options passed to us from all sources.
 *
 * @param  {Object} options [description]
 * @return {boolean}        [description]
 */
build.validate = function( options ) {
  if ( !__.isObject( options.webConfig.build ) ) {
    helpers.log.error('There is no \'build\' key in your mantriConf file.');
    return false;
  }

  if ( !__.isString( options.webConfig.build.input ) ) {
    helpers.log.error('There is no \'build.input\' key in your mantriConf file.');
    return false;
  }

  return true;
};



module.exports = build;
