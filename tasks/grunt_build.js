/*
 * deppy
 * https://github.com/thanpolas/deppy
 *
 * Copyright (c) 2013 Thanasis Polychronakis
 * Licensed under the MIT license.
 */

var deppyBuild = require('./deppy_build');

module.exports = function(grunt) {
  // Please see the grunt documentation for more information regarding task
  // creation: https://github.com/gruntjs/grunt/blob/devel/docs/toc.md

  grunt.registerMultiTask('deppyBuild', 'Run the build script', function() {
    var done = this.async();
    deppyBuild.build(done, this.target, this.files[0].src, this.files[0].dest);
  });


};
