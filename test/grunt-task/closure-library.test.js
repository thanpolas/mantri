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


describe('15. Closure Library :: ', function(){

  var spyDeps, stubCmd;
  beforeEach(function() {
  });

  afterEach(function() {
  });

  it('15.1 produce compiled files including goog.string source', function() {

    var files = [
      'testCaseCL.build.js',
    ];

    var actual, expected;
    files.forEach(function(file){
      actual = grunt.file.read(tmp + file);
      expected = grunt.file.read(fixtures + file);
      assert.equal(actual, expected, 'build output should equal: ' + file);
    });
  });
});
