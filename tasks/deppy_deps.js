/*jshint camelcase:false */
/**
 * Build the dependencies file deps.js for the given options
 *
 */

var cTools = require('grunt-closure-tools'),
    grunt  = require('grunt');

var deppy = {};

/**
 * Run the dependency task.
 */
deppy.deps = function( cb, target, documentRoot, optDest, optOptions ) {

  var tools = cTools();

  var dest = optDest || documentRoot + '/deps.js';
  var depsOptions = {
    depswriter: 'closure-bin/build/depswriter.py',
    root_with_prefix: ['"' + documentRoot + ' ./"']
  };
  var depsFileObj = {
    dest: dest
  };

  var command = tools.depsWriter.createCommand( depsOptions, depsFileObj );

  if ( !command ) {
    tools.helpers.log.error('Create command failed for depsWriter');
    cb( false );
    return;
  }

  var commands = [ {cmd: command, dest: target} ];

  tools.helpers.runCommands( commands, cb );

};

module.exports = deppy;
