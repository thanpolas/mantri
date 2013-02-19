/**
 * The bootstrap grunt file and library API exported
 *
 */

var helpers = require('../lib/helpers'),
    build   = require('./grunt_build'),
    deps    = require('./grunt_deps'),
    path         = require('path');

module.exports = function(grunt) {

  // if grunt is not provided, then expose internal API
  if ('object' !== typeof(grunt)) {
    return {
      helpers: helpers,
      build: require('../lib/mantri_build'),
      deps: require('../lib/mantri_deps'),
      gruntDeps: deps,
      gruntBuild: build

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

  grunt.registerTask('mantriInit', function( optPath ) {
    var savePath = path.join ('./', optPath || '' );

    var copyFiles = [
      'dist/mantri.web.js',
      'dist/mantriConf.json'
    ];

    var dest, src;
    copyFiles.forEach( function( file ) {
      src = helpers.getPath( file );
      dest = path.join( savePath, path.basename( src ) );

      // do not overwrite the conf file!
      if ( grunt.file.isFile( dest ) &&
        'mantriConf.json' === path.basename( dest )) {
        helpers.log.warn( 'Did not copy ' + path.basename( dest ).red +
          ' file, it already exists');
        return;
      }

      helpers.log.info( 'Copying ' + src.cyan + ' -> ' + dest.cyan );
      grunt.file.copy( src, dest );
    });

    helpers.log.info( 'You are ready to get started!' );

  });

};
