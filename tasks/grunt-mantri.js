/**
 * The bootstrap grunt file and library API exported
 *
 */

var helpers = require('../lib/helpers'),
    build   = require('./grunt-build'),
    mantriInit = require('../lib/mantri-init'),
    deps    = require('./grunt-deps'),
    path         = require('path');

function mantriMain(grunt) {

  // register the rest of the tasks
  build( grunt );
  deps( grunt );

  grunt.registerTask('mantriInit', function( optPath ) {
    var savePath = path.join ('./', optPath || '' );

    mantriInit.run(savePath);
  });

}

module.exports = mantriMain;

// overwrite helper's logging methods
var localGrunt = require('grunt');
helpers.log = {
  warn: function(msg) { localGrunt.log.warn(msg); },
  info: function(msg) { localGrunt.log.writeln(msg); },
  error: function(msg) { localGrunt.log.error(msg); },
  debug: function(debug, msg) {
    if ( !debug ) return;
    localGrunt.log.writeln( 'debug :: '.blue + msg );
  }

};


mantriMain.helpers = helpers;
mantriMain.build = require('../lib/mantri-build');
mantriMain.deps = require('../lib/mantri-deps');
mantriMain.cli = require('../lib/mantri-cli');
mantriMain.gruntDeps = deps;
mantriMain.gruntBuild = build;

