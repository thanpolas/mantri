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

var compile = module.exports = {};

// Define the path to the closure compiler jar file.
var CLOSURE_COMPILER = compiler.getPathSS();
var CLOSURE_BUILDER  = cTools.getPath('build/closurebuilder.py');


/**
 * Construct and execute the compilation command.
 *
 * @param {Object} compileOpts Options required for compiling.
 *   @param {string} jsRoot The rootpath.
 *   @param {Tempdir} gmockDir Tempdir instance, where the google mock is.
 *   @param {string=} src The starting point, omit if "namespace" is defined.
 *   @param {string} dest Destination file.
 *   @param {string=} target The target we are working on, a name to identify the task.
 *   @param {boolean=} debug print debug info.
 *   @param {string=} outputWrapper The output wrapper if needed.
 *   @param {string=} namespace if defined, the explicit GC option
 *     "closure_entry_point" will be used.
 *   @param {boolean=} noCompile experimental no compilation flag.
 *   @param {string=} sourceMapFile Set the filename of the sourcemap file.
 *
 * @param {Function(boolean)} cb Callback.
 * @private
 */
compile.compile = function(compileOpts, cb) {

  // check if this is a module
  compileOpts.isCore = !compileOpts.namespace;
  compileOpts.isModule = !!compileOpts.namespace;

  //
  //
  // Prepare the options for the closureBuilder task.
  //
  //
  var rootPath = [ compileOpts.jsRoot ];
  rootPath.push( compileOpts.gmockDir.path );
  var cToolsOptions = {
    builder: helpers.getPath( CLOSURE_BUILDER ),
    compile: !compileOpts.noCompile,
    compilerFile: helpers.getPath( CLOSURE_COMPILER ),
    compilerOpts: {
      compilation_level: 'SIMPLE_OPTIMIZATIONS',
      warning_level: (compileOpts.debug ? 'VERBOSE' : 'QUIET'),
      // go wild here, name every exception in the book to be ignored
      jscomp_off: gcTools.closureOpts.compiler.jscomp_off,
    }
  };

  if (compileOpts.sourceMapFile) {
    cToolsOptions.compilerOpts.create_source_map = compileOpts.sourceMapFile;
    cToolsOptions.compilerOpts.source_map_format = 'V3';
  }

  if (compileOpts.src) {
    cToolsOptions.inputs = compileOpts.src;
  }

  if (compileOpts.outputWrapper) {
    cToolsOptions.compilerOpts.output_wrapper = compileOpts.outputWrapper;
  }

  if (compileOpts.isModule) {
    cToolsOptions.compilerOpts.only_closure_dependencies = null;
    cToolsOptions.compilerOpts.closure_entry_point = compileOpts.namespace;
    cToolsOptions.namespaces = compileOpts.namespace;
  }

  var cToolsFileObj = {
    src: rootPath,
    dest: compileOpts.dest
  };

  var command = gcTools.builder.createCommand( cToolsOptions, cToolsFileObj );

  if ( !command ) {
    helpers.log.error('Create shell command failed for builder');
    compileOpts.gmockDir.rmdir();
    cb( false );
    return;
  }

  //
  //
  // Run the command.
  //
  //
  helpers.log.debug( compileOpts.debug, 'Builder command constructed. Executing...');

  var commands = [ {cmd: command, dest: compileOpts.target} ];
  helpers.runCommands( commands, compile._afterCompile.bind(null, cb, compileOpts),
    !compileOpts.debug);
};

/**
 * Operations does to the file AFTER compilation
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
    var appendSnippet = '\n//# sourceMappingURL=';
    appendSnippet += (compileOpts.sourceMappingURL || compileOpts.sourceMapFile);
    fs.appendFileSync(compileOpts.dest, appendSnippet);
  }

  cb(true);
};

/**
 * Update the SourceMap so it works when .js file is concatenated with vendor libs.
 *
 * @param {Object} buildOpts The build options.
 * @param {number} newlines how many newlines the vendor libs are.
 */
compile.updateSourceMap = function(buildOpts, newlines) {
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
