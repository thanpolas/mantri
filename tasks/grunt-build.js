/*
 * mantri
 * https://github.com/thanpolas/mantri
 *
 * Copyright (c) 2013 Thanasis Polychronakis
 * Licensed under the MIT license.
 */

var mantriBuild = require('../lib/mantri-build');

module.exports = function(grunt) {
  // Please see the grunt documentation for more information regarding task
  // creation: https://github.com/gruntjs/grunt/blob/devel/docs/toc.md

  grunt.registerMultiTask('mantriBuild', 'Run the build script', function() {
    var done = this.async();

    var opts = this.options({
      src: this.files[0].src,
      dest: this.files[0].dest,
      target: this.target
    });

    mantriBuild.useMantriConf(opts, done);
  });
};
