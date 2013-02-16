/*jshint camelcase:false */
/**
 * Build the dependencies file deps.js for the given options
 *
 */

var gcTools = require('grunt-closure-tools')(),
    helpers= require('./helpers'),
    grunt  = require('grunt'),
    cTools   = require('closure-tools');

var mantri = {},
    DEPSWRITER = cTools.getPath('build/depswriter.py');

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

  helpers.runCommands( commands, cb );

};

module.exports = mantri;
