/*
 * mantri
 * https://github.com/thanpolas/mantri
 *
 * Copyright (c) 2013 Thanasis Polychronakis
 * Licensed under the MIT license.
 */

var mantriBuild = require('../lib/mantri_build');

module.exports = function(grunt) {
  // Please see the grunt documentation for more information regarding task
  // creation: https://github.com/gruntjs/grunt/blob/devel/docs/toc.md

  grunt.registerMultiTask('mantriBuild', 'Run the build script', function() {
    var done = this.async();

    // TODO Not sure why .orig always works while .get doesn't
    // maybe a bug, check it out. The issue appears when building for
    // the testCase
    mantriBuild.build(done, this.target, this.files[0].src,
      this.files[0].dest, this.options() );
  });


};
