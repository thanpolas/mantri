/*jshint camelcase:false */
/**
 * Build the source code
 *
 */

var cTools = require('grunt-closure-tools')(),
    grunt  = require('grunt'),
    __     = require('underscore'),
    path   = require('path'),
    Tempdir = require('temporary/lib/dir');

var build = {};

// Define the path to the closure compiler jar file.
var CLOSURE_COMPILER = 'build/closure_compiler/sscompiler.jar';

/**
 * Run the build task.
 *
 * We require the deppy configuration file that bootstraps the web.
 *
 * We expect to find there information about how to perform the build.
 *
 * After we are satisfied with what we collect we start the build process.
 */
build.build = function( cb, target, confFile, optDest, optOptions ) {
  // cast to string
  confFile = confFile + '';

  //
  //
  // Read and validate the config file
  //
  //
  // require the config file. Flow continues at start() function.
  var config = grunt.file.readJSON(confFile);

  // bundle all option files
  var options = {
    target: target,
    webConfig: config,
    dest: optDest,
    buildOpts: optOptions
  };

  if (! build.validate( options )) {
    // error messages sent by validate
    cb( false );
    return;
  }

  //
  //
  // Create the temp google closure mock dir and file
  //
  //
  var tmpDir = new Tempdir();
  // write the mock goog base file in the temp dir.
  var contents = 'var goog = goog || {}; // Identifies this file as the Closure base.\n';
  grunt.file.write( tmpDir.path + '/base.js', contents) ;
  // resolve what the source and dest will be for the builder
  var jsRoot = path.dirname( confFile ) + '/' + path.dirname( config.build.input );

  var src = [ jsRoot ];
  src.push( tmpDir.path );

  //
  //
  // Prepare the options for the closureBuilder task.
  //
  //
  var cToolsOptions = {
    builder: CLOSURE_COMPILER,
    inputs: path.dirname( confFile ) + '/' + config.build.input,
    compile: true,
    compilerFile: 'closure-bin/compiler/compiler.jar',
    compilerOpts: {
      compilation_level: 'WHITESPACE_ONLY',
      jscomp_off: [
        '"checkTypes"',
        '"strictModuleDepCheck"'
      ]

    }
  };
  var cToolsFileObj = {
    src: src,
    dest: optDest || config.build.dest
  };

  var command = cTools.builder.createCommand( cToolsOptions, cToolsFileObj );
  if ( !command ) {
    cTools.helpers.log.error('Create shell command failed for builder');
    cb( false );
    return;
  }

  //
  //
  // Run the command.
  //
  //
  var commands = [ {cmd: command, dest: target} ];

  cTools.helpers.runCommands( commands, cb );

};


/**
 * Validate the options passed to us from all sources.
 *
 * @param  {Object} options [description]
 * @return {boolean}        [description]
 */
build.validate = function( options ) {
  if ( !__.isObject( options.webConfig.build ) ) {
    cTools.helpers.log.error('There is no \'build\' key in your deppyConf file.');
    return false;
  }

  if ( !__.isString( options.webConfig.build.input ) ) {
    cTools.helpers.log.error('There is no \'build.input\' key in your deppyConf file.');
    return false;
  }

  return true;
};


module.exports = build;
