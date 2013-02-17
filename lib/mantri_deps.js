/*jshint camelcase:false */
/**
 * Build the dependencies file deps.js for the given options
 *
 */

var gcTools = require('grunt-closure-tools')(),
    helpers= require('./helpers'),
    grunt  = require('grunt'),
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
     'https://github.com/thanpolas/mantri/wiki/Mantri-As-a-Grunt-Plugin' ;

/**
 * Run the dependency task.
 *
 */
mantri.deps = function( cb, target, documentRoot, optDest, optOptions ) {

  var dest = optDest || documentRoot + '/deps.js';

  var depsOptions = {
    depswriter: helpers.getPath( DEPSWRITER ),
    root_with_prefix: ['"' + documentRoot + ' ./"'],
    buildOpts: optOptions || {}
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

  var commands = [ {cmd: command, dest: target} ];

  helpers.runCommands( commands, function( state, stderr, stdout ) {

    if ( !state && knownErrors.test(stderr) ) {
      helpers.log.warn( helpers.getWarn( knownErrorsMessage ) );
    }
    cb(state);
  } );

};

module.exports = mantri;
