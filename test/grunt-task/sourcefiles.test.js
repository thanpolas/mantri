/**
 * @fileOverview Sourcefiles test.
 */

var tasks  = require('../../tasks/grunt-mantri'),
    cTools = require('grunt-closure-tools'),
    sinon  = require('sinon'),
    // expect = require('chai').expect,
    assert = require('chai').assert,
    configs= require('../fixtures/grunt_configs.fixture'),
    grunt  = require('grunt');

var tmp = 'temp/';
var fixtures = 'test/expected/';


describe('14. Sourcefiles :: ', function(){

  var spyDeps, stubCmd;
  beforeEach(function() {
  });

  afterEach(function() {
  });

  it('14.1 produce compiled files with sourceMapUrl signature', function() {

    var files = [
      'app-sourcemap-build-core.min.js',
      'app-sourcemap-build-module-one.min.js',
      'app-sourcemap-build-module-two.min.js',
    ];

    var actual, expected;
    files.forEach(function(file){
      actual = grunt.file.read(tmp + file);
      expected = grunt.file.read(fixtures + file);
      assert.equal(actual, expected, 'build output should equal: ' + file);
    });
  });

  it('14.2 Sourcemap files should be created', function() {
      assert.ok(grunt.file.exists('temp/app-sourcemap-build-core.js.map'));
      assert.ok(grunt.file.exists('temp/app-sourcemap-build-module-one.js.map'));
      assert.ok(grunt.file.exists('temp/app-sourcemap-build-module-two.js.map'));
  });

});
