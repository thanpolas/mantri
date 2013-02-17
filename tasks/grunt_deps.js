/*
 * mantri
 * https://github.com/thanpolas/mantri
 *
 * Copyright (c) 2013 Thanasis Polychronakis
 * Licensed under the MIT license.
 */

var mantriDeps = require('../lib/mantri_deps');

module.exports = function(grunt) {
  // Please see the grunt documentation for more information regarding task
  // creation: https://github.com/gruntjs/grunt/blob/devel/docs/toc.md

  grunt.registerMultiTask('mantriDeps', 'Run the dependency script', function() {
    var done = this.async();
    mantriDeps.deps(done, this.files[0], this.options(), this.target);
  });


};
