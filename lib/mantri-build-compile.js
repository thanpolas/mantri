/*jshint camelcase:false */
/**
 * @fileOverview The compile part of the build operation.
 */
var fs = require('fs');

var gcTools = require('grunt-closure-tools');
var grunt  = require('grunt');
var cTools   = require('closure-tools');
var compiler = require('superstartup-closure-compiler');

var helpers= require('./helpers');
var sourcemap = require('./mantri-build-sourcemap');

var compile = module.exports = {};

// Define the path to the closure compiler jar file.
var CLOSURE_COMPILER = compiler.getPath();
var CLOSURE_BUILDER  = cTools.getPath('build/closurebuilder.py');


/**
 * Construct and execute the compilation command.
 *
 * We first build the app (bundle files together)
 * Then in a second step we compile, including all the vendor files.
 *
 * @param {Object} compileOpts Options required for compiling.
 *   @param {string} jsRoot The rootpath.
 *   @param {string} gmockDir Where the google mock is.
 *   @param {string=} src The starting point, omit if "namespace" is defined.
 *   @param {string} dest Destination file.
 *   @param {string} tempBuildDest Temporary location to store bundled uncompiled file.
 *   @param {string=} target The target we are working on, a name to identify the task.
 *   @param {boolean=} debug print debug info.
 *   @param {string=} outputWrapper The output wrapper if needed.
 *   @param {string=} namespace if defined, the explicit GC option
 *     "closure_entry_point" will be used.
 *   @param {boolean=} noCompile experimental no compilation flag.
 *   @param {string=} sourceMapFile Set the filename of the sourcemap file.
 *   @param {string=} sourceMappingURL if sourcemaps are enabled, use this to
 *     define the url location of the sourcemap, used by the browser.
 *   @param {Array.<string>|string=} vendorFiles vendor libraries we want to
 *     include in the bundled output.
 * @param {Function(boolean)} cb Callback.
 * @private
 */
compile.compile = function(compileOpts, cb) {

  // compile._compileActual(cb, compileOpts, true);
  // return;

  // check if this is a module
  compileOpts.isCore = !compileOpts.namespace;
  compileOpts.isModule = !!compileOpts.namespace;


  compile.getDepsFiles(compileOpts,
    compile._compileActual.bind(null, compileOpts, cb));
};

/**
 * Will look for all the dependencies and return them in an array
 * with filenames in sequence of concatenation.
 *
 * @param {Object} compileOpts Compilation options.
 * @param {Function(boolean, Array.<string>)} cb The callback.
 */
compile.getDepsFiles = function(compileOpts, cb) {
  //
  //
  // Prepare the options for the closureBuilder task.
  //
  //
  //
  var rootPath = [ compileOpts.jsRoot ];
  rootPath.push( compileOpts.gmockDir );

  var cBuilderOpts = {
    builder: helpers.getPath( CLOSURE_BUILDER ),
    output_mode: 'list',
  };

  if (compileOpts.src) {
    cBuilderOpts.inputs = [compileOpts.src];
  }

  if (true) {
    // cBuilderOpts.inputs.push(compileOpts.gmockDir + '/closure/goog/base.js');
  }

  if (compileOpts.isModule) {
    cBuilderOpts.namespaces = compileOpts.namespace;
  }
  var cToolsFileObj = {
    src: rootPath,
    // dest: compileOpts.tempBuildDest,
  };

  var command = gcTools.builder.createCommand( cBuilderOpts, cToolsFileObj );

  if ( !command ) {
    helpers.log.error('Create shell command failed for builder');
    cb( false );
    return;
  }

  /** Handle the builder execution response */
  function commandResponse(status, stdout) {
    if (!status) { return cb(status); }

    var files = stdout.split('\n');
    var filesUse = [];
    files.forEach(function(file) {
      if (grunt.file.isFile(file)) {
        filesUse.push(file);
      }
    });

    cb(true, filesUse);
  }

  //
  //
  // Run the command.
  //
  //
  helpers.log.debug( compileOpts.debug, 'Builder command constructed. Executing...');
  helpers.executeCommand( command, commandResponse , !compileOpts.debug);
};

/**
 * After the bundling command perform the actual compilation command.
 *
 * @param {Object} compileOpts Compile options.
 * @param {Function(Error=)} cb The callback.
 * @param {boolean} status False if compilation command failed.
 * @param {Array.<string>} filesUse an array of sequenced files to use for compilation.
 * @private
 */
compile._compileActual = function(compileOpts, cb, status, filesUse) {
  if (!status) {return cb(status);}
  if (compileOpts.noCompile) {return compile._afterCompile(cb, compileOpts, true);}

  var cCompilerOpts = {
    compilerFile: helpers.getPath( CLOSURE_COMPILER ),
    compilerOpts: {
      compilation_level: 'SIMPLE_OPTIMIZATIONS',
      warning_level: (compileOpts.debug ? 'VERBOSE' : 'QUIET'),
      // go wild here, name every exception in the book to be ignored
      jscomp_off: gcTools.closureOpts.compiler.jscomp_off,
    }
  };

  if (compileOpts.sourceMapFile) {
    cCompilerOpts.compilerOpts.create_source_map = compileOpts.sourceMapFile;
    cCompilerOpts.compilerOpts.source_map_format = 'V3';
  }

  if (compileOpts.outputWrapper) {
    cCompilerOpts.compilerOpts.output_wrapper = '"' + compileOpts.outputWrapper + '"';
  }

  // prep source files
  var src = [];
  if (Array.isArray(compileOpts.vendorFiles)) {
    src = compileOpts.vendorFiles;
  } else if (compileOpts.vendorFiles) {
    src.push(compileOpts.vendorFiles);
  }
  src = src.concat(filesUse);

  // prep compile command
  var cToolsFileObj = {
    src: src,
    dest: compileOpts.dest,
  };
  var command = gcTools.compiler.compileCommand( cCompilerOpts, cToolsFileObj );

  helpers.log.debug( compileOpts.debug, 'Compiler command constructed. Executing...');

  var commands = [ {cmd: command, dest: compileOpts.target} ];
  helpers.runCommands( commands, compile._afterCompile.bind(null, cb, compileOpts),
    !compileOpts.debug);

};

/**
 * After compilation ops.
 *
 * @param {Function(Error=)} cb The callback.
 * @param {Object} compileOpts Compile options.
 * @param {boolean} status False if compilation command failed.
 * @private
 */
compile._afterCompile = function(cb, compileOpts, status) {
  if (!status) {return cb(status);}
  helpers.log.debug( compileOpts.debug, 'Compile complete, applying' +
    ' after-compile ops');

  if (compileOpts.sourceMapFile) {
    sourcemap.appendSnippet(compileOpts);
    sourcemap.fixSourcemapFile(compileOpts);
  }

  cb(true);
};


