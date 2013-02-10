/**
 * Bootstrap file for grunt
 *
 */

var gruntDeps    = require('./grunt_deps'),
    gruntBuild   = require('./grunt_build'),
    cTools       = require('grunt-closure-tools');

module.exports = function(grunt) {

  gruntDeps(grunt);
  gruntBuild(grunt);

};
