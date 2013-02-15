/**
 * The bootstrap grunt file and library API exported
 *
 */

var helpers = require('./helpers'),
    build   = require('./grunt_build'),
    deps    = require('./grunt_deps'),
    tasks   = require('./grunt_tasks');

module.exports = function(grunt) {

  // if grunt is not provided, then expose internal API
  if ('object' !== typeof(grunt)) {
    return {
      helpers: helpers,
      build: require('./mantri_build'),
      deps: require('./mantro_deps')
    };
  }

  // overwrite helper's logging methods
  helpers.log = {
    warn: function(msg) { grunt.log.warn(msg); },
    info: function(msg) { grunt.log.writeln(msg); },
    error: function(msg) { grunt.log.error(msg); },
    debug: function(debug, msg) {
      if ( !debug ) return;
      grunt.log.writeln( 'debug :: '.blue + msg );
    }

  };

  // register the rest of the tasks
  build( grunt );
  deps( grunt );

};
