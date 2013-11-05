/*
 * mantri
 * https://github.com/thanpolas/mantri
 *
 * Copyright (c) 2013 Thanasis Polychronakis
 * Licensed under the MIT license.
 */

var __ = require('lodash');

var mantriBuild = require('../lib/mantri-build');

module.exports = function(grunt) {
  // Please see the grunt documentation for more information regarding task
  // creation: https://github.com/gruntjs/grunt/blob/devel/docs/toc.md

  grunt.registerMultiTask('mantriBuild', 'Run the build script', function() {
    var done = this.async();

    var src = this.files[0].src[0];

    if (!src) {
      grunt.log.error('No valid value was found in the "src" field');
      return done(false);
    }

    // validate and check extension of source
    if (!__.isString(src)) {
      grunt.log.error('Mantri only accepts type String as value for "src" field');
      return done(false);
    }

    var srcExt = src.split('.').pop();
    if (0 > ['json'].indexOf(srcExt)) {
      grunt.log.error('mantriBuild Task only accepts a single file with ".json" extention' +
        ' as value for "src" field (case sensitive)');
      return done(false);
    }

    var opts = this.options({
      mantriConf: src,
      dest: this.files[0].dest,
      target: this.target,
      debug: false,
    });

    // sanitize possible 'src' leak
    delete opts.src;

    mantriBuild.run(opts, done);
  });
};
