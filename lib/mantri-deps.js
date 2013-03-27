/*jshint camelcase:false */
/**
 * Build the dependencies file deps.js for the given options
 *
 */

var gcTools  = require('grunt-closure-tools'),
    helpers  = require('./helpers'),
    path     = require('path'),
    cTools   = require('closure-tools');

var mantri = {};

var DEPSWRITER = cTools.getPath('build/depswriter.py');

var knownErrors = /(Base files should not provide or require namespaces)/gm;

var knownErrorsMessage = 'Please make sure there are no files in your path\nthat don\'t' +
     ' belong to your application.\n\n' +
     'Most usual suspect is the "node_modules" directory.\nIf that\'s the case' +
     ' you will need to define a more\nspecific path that your project\'s ' +
     'root.\n\n' +
     'Read more about this:\n' +
     'https://github.com/thanpolas/mantri/wiki/Grunt-Task-mantriDeps' ;

/**
 * Run the dependency task.
 *
 *
 * The options object expects these keys:
 *   src {string=} The source folder to scan.
 *   dest {string=} The filename to output the result.
 *   root {string=} The path to the webroot.
 *   target {string=} The target we are working on, a name to identify the task.
 *
 * @param  {Object}   options A map with options as defined above.
 * @param  {Function} cb      [description]
 */
mantri.run = function( options, cb) {

  // try to figure out the document root. It's a path relative to where
  // the Grunfile is.
  var documentRoot = options.root || options.src || './';

  // get the source, where we'll scan for the js files
  var src = options.src || './';

  // now compare documentRoot and source, if they are different
  // we need to get the relative path of the source compared
  // to the document root.
  //
  var relSrc;
  if ( documentRoot !== src ) {
    relSrc = path.relative( documentRoot, src );
  } else {
    relSrc = './';
  }

  // get the destination
  var dest = options.dest || path.join( documentRoot, 'deps.js' );

  var depsOptions = {
    depswriter: helpers.getPath( DEPSWRITER ),
    root_with_prefix: ['"' + src + ' ' + relSrc + '"']
  };
  var depsFileObj = {
    dest: dest
  };

  var command = gcTools.depsWriter.createCommand( depsOptions, depsFileObj );

  if ( !command ) {
    helpers.log.error('Create command failed for depsWriter');
    cb( false );
    return;
  }

  var commands = [ {cmd: command, dest: options.target} ];

  helpers.runCommands( commands, function( state, stderr ) {

    if ( !state && knownErrors.test(stderr) ) {
      helpers.log.warn( helpers.getWarn( knownErrorsMessage ) );
    }
    cb(state);
  } );

};

module.exports = mantri;
