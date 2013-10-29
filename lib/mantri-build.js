/*jshint camelcase:false */
/**
 * Build the source code
 *
 */
var fs     = require('fs');

var fse = require('fs-extra');
var async = require('async');
var gcTools = require('grunt-closure-tools');
var grunt  = require('grunt');
var __     = require('lodash');
var Tempdir = require('temporary/lib/dir');
var gUglify = require('grunt-contrib-uglify')().uglify.init( grunt );
var cTools   = require('closure-tools');
var compiler = require('superstartup-closure-compiler');

var valid = require('./mantri-build-validate');
var helpers= require('./helpers');

var build = module.exports = {
  _tmpDir: null,
  GOOG_BASE_FILE: 'base.js'
};

var noop = function(){};

// Define the path to the closure compiler jar file.
var CLOSURE_COMPILER = compiler.getPathSS();
var CLOSURE_BUILDER  = cTools.getPath('build/closurebuilder.py');
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
 * @param  {Function(Error=)} cb The callback.
 */
build.run = function(buildOpts, cb) {
  // Sanitize Build Options
  if (!valid.validate( buildOpts )) {
    // error messages sent by validate
    cb(new Error());
    return;
  }
  helpers.log.debug( buildOpts.debug, 'Passed Validations.');

  // prepare internal options
  var options = {};
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
    if (!build._bundleLibs(buildOpts, options)) {
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
  };

  // first perform the default, main compile
  build._compile(compileOpts, function(status) {
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

    async.map(
      buildOpts.buildModules,
      __.partial(build._compileModule, buildOpts, options),
      __.partial(build._finishBuild, buildOpts, options)
    );
  });

};

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
 * @param {Function(boolean)} cb Callback.
 * @private
 */
build._compile = function(compileOpts, cb) {

  //
  //
  // Prepare the options for the closureBuilder task.
  //
  //
  var rootPath = [ compileOpts.jsRoot ];
  rootPath.push( compileOpts.gmockDir.path );
  var cToolsOptions = {
    builder: helpers.getPath( CLOSURE_BUILDER ),
    compile: true,
    compilerFile: helpers.getPath( CLOSURE_COMPILER ),
    compilerOpts: {
      compilation_level: 'SIMPLE_OPTIMIZATIONS',
      warning_level: (compileOpts.debug ? 'VERBOSE' : 'QUIET'),
      // go wild here, name every exception in the book to be ignored
      jscomp_off: gcTools.closureOpts.compiler.jscomp_off,
    }
  };

  if (compileOpts.src) {
    cToolsOptions.inputs = compileOpts.src;
  }

  if (compileOpts.outputWrapper) {
    cToolsOptions.compilerOpts.output_wrapper = compileOpts.outputWrapper;
  }

  if (compileOpts.namespace) {
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

  helpers.runCommands( commands, cb, !compileOpts.debug);
};

/**
 * Prepare and compile a module. Used when multiple modules are defined in
 * mantriConf.json file.
 *
 * @param {Object} buildOpts Build options.
 * @param {Object} options The options object.
 * @param {Object} buildModule A dictionary as defined in the "buildModule" key
 *   defined in the mantriConf.json file.
 * @param {Function(Error=)} cb Callback.
 * @private
 */
build._compileModule = function(buildOpts, options, buildModule, cb) {
  var compileOpts = {
    jsRoot: buildOpts.jsRoot,
    gmockDir: options._tmpDir,
    dest: buildModule.dest,
    target: buildOpts.target,
    debug: options.debug,
    outputWrapper: buildModule.outputWrapper,
    namespace: buildModule.namespace,
  };


  helpers.log.debug( compileOpts.debug, 'Compiling module: ' +
    buildModule.namespace);

  build._compile(compileOpts, function(status) {
    if (!status) {return cb(new Error());}
    cb();
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

  //
  //
  // check if there is a wrapper option
  //
  //
  // if (buildOpts.outputWrapper) {
  //   var bundledApp = grunt.file.read( buildOpts.dest );
  //   // remove trailing newline
  //   var applen = bundledApp.length;
  //   if ('\n' === bundledApp.substr(applen-1)) {
  //     bundledApp = bundledApp.substr(0, applen-2);
  //   }

  //   var wrappedApp = __.template(buildOpts.outputWrapper)({
  //     output: bundledApp
  //   }) + '\n'; // add a trailing newline
  //   grunt.file.write(buildOpts.dest, wrappedApp);
  //   wrappedApp = bundledApp = null;
  // }

  helpers.log.info('\nBuild complete!'.green + '\n\nStats for: ' + buildOpts.dest.blue);

  // generate stats
  helpers.generateStats(buildOpts.dest, options.cb);

};

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
 * Minify a file.
 *
 * @param {string} src Sourcefile.
 * @param {string} dest destination.
 * @return {boolean} operation status.
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

