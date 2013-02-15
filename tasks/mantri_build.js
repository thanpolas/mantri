/*jshint camelcase:false */
/**
 * Build the source code
 *
 */

var cTools = require('grunt-closure-tools')(),
    helpers= require('./helpers'),
    grunt  = require('grunt'),
    __     = require('underscore'),
    path   = require('path'),
    Tempdir = require('temporary/lib/dir'),
    fs     = require('fs');

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
var CLOSURE_COMPILER = 'node_modules/superstartup-closure-compiler/build/sscompiler.jar',
    CLOSURE_BUILDER  = 'closure-bin/build/closurebuilder.py',
    VENDOR_BUNDLE    = 'libs.js';

/**
 * Run the build task.
 *
 * We require the mantri configuration file that bootstraps the web.
 *
 * We expect to find there information about how to perform the build.
 *
 * After we are satisfied with what we collect we start the build process.
 */
build.build = function( cb, target, confFile, optDest, optOptions ) {

  // cast to string
  confFile = confFile + '';
  // reset internals

  //
  //
  // Read and validate the web config file
  //
  //
  // require the config file. Flow continues at start() function.
  var webConfig = {};
  if ( !grunt.file.isFile(confFile) ) {
    helpers.log.error('Could not locate mantriConf.json file.');
    cb( false );
    return;
  } else {
    webConfig = grunt.file.readJSON( confFile );
  }

  // bundle all option files
  var options = {
    target: target,
    webConfig: webConfig,
    dest: optDest,
    buildOpts: optOptions || {},
    cb: cb
  };


  if (! build.validate( options )) {
    // error messages sent by validate
    cb( false );
    return;
  }
  helpers.log.debug( options.debug, 'Passe Validations.');

  // Define debug mode
  options.debug = !!options.buildOpts.debug;

  // create new temp dir and prep google mock.
  options._tmpDir      = new Tempdir();
  options.googMock     = options._tmpDir.path + '/' + build.GOOG_BASE_FILE;
  options.vendorFiles  = options._tmpDir.path + '/' + VENDOR_BUNDLE;
  options.jsDirFrag    = path.dirname( webConfig.build.input );
  options.documentRoot = path.dirname( confFile );
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
  // Resolve and bundle all third party dependencies
  //
  //
  if ( !build._appendVendorLibs( options ) ) {
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
    inputs: path.dirname( confFile ) + '/' + webConfig.build.input,
    compile: true,
    compilerFile: helpers.getPath( CLOSURE_COMPILER ),
    compilerOpts: {
      compilation_level: 'SIMPLE_OPTIMIZATIONS',
      warning_level: (options.debug ? 'VERBOSE' : 'QUIET'),
      // go wild here, name every exception in the book to be ignored
      // WE BE NO SCARE HAXORShh
      jscomp_off: cTools.closureOpts.compiler.jscomp_off
    }
  };
  var cToolsFileObj = {
    src: src,
    dest: optDest || webConfig.build.dest
  };

  var command = cTools.builder.createCommand( cToolsOptions, cToolsFileObj );
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
  var commands = [ {cmd: command, dest: target} ];

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
      options.cb(false);
      return;
    }

    // minify the libs using uglify.
    // For reasons i cannot explain certain patterns of libs make the
    // closure compiler to blow up (litteraly)


    options._tmpDir.rmdir();
    options.cb( status );

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

    fs.writeFileSync( options.vendorFiles, fileSrc );
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
