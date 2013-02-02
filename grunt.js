/**
 * [exports description]
 * @param  {[type]} grunt [description]
 * @return {[type]}       [description]
 */
module.exports = function( grunt ) {
  'use strict';
  //
  // Grunt configuration:
  //
  // https://github.com/cowboy/grunt/blob/master/docs/getting_started.md
  //
  grunt.initConfig({

    // Project configuration
    // ---------------------

  });

  // Alias the `test` task to run the `mocha` task instead
  grunt.registerTask('test', 'server:phantom mocha');

};
