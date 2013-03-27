/**
 * @fileoverview the init task, mantri scaffolding.
 */

var grunt = require('grunt'),
    path  = require('path');

var helpers = require('./helpers');

var init = module.exports = {};


/**
 * Copy mantri files in the designated directory
 *
 * @param {string=} optDest destination folder.
 */
init.run = function(optDest) {
    var savePath = optDest || './';

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

};
