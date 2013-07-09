/**
 * mantri
 * https://github.com/thanpolas/mantri
 *
 * Copyright (c) 2013 Thanasis Polychronakis
 * Licensed under the MIT license.
 */

var path = require('path');

var __ = require('lodash');

var mantriBuild = require('../lib/mantri-build');

module.exports = function(grunt) {
  // Please see the grunt documentation for more information regarding task
  // creation: https://github.com/gruntjs/grunt/blob/devel/docs/toc.md

  grunt.registerMultiTask('mantriBuiltModules', 'Run the built-modules script', function() {
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
    if (0 > ['js'].indexOf(srcExt)) {
      grunt.log.error('Mantri only accepts files with ".js" extention' +
        ' as value for "src" field (case sensitive) for the built-modules task.');
      return done(false);
    }

    var opts = this.options({
      src: src,
      dest: this.files[0].dest,
      target: this.target
    });

    opts.jsRoot = opts.jsRoot || path.dirname(src);
    mantriBuild.run(opts, done);
  });
};
