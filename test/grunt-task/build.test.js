/**
 * @fileOverview The build task test.
 */

var tasks  = require('../../tasks/grunt-mantri'),
    cTools = require('grunt-closure-tools'),
    sinon  = require('sinon'),
    expect = require('chai').expect,
    assert = require('chai').assert,
    configs= require('../fixtures/grunt_configs.fixture'),
    grunt  = require('grunt');

var tmp = 'temp/';
var fixtures = 'test/expected/';


describe('10. Grunt task :: build :: ', function(){

  var spyDeps, stubCmd;
  beforeEach(function() {
  });

  afterEach(function() {
  });

  it('10.1 produce the proper result', function() {

    var actualFile = 'testCase.build.js';
    var actual = grunt.file.read(tmp + actualFile);
    var expected = grunt.file.read(fixtures + actualFile);
    assert.equal(actual, expected, 'task output should equal: ' + actualFile);
  });

  it('10.2 should produce the proper result with outputWrapper', function() {
    var actualFile = 'testCaseAlt.build.js';
    var actual = grunt.file.read(tmp + actualFile);
    var expected = grunt.file.read(fixtures + actualFile);

    assert.equal(actual, expected, 'task output should equal: ' + actualFile);
  });

  it('10.3 should produce the proper result when not using mantriConf', function() {
    var actualFile = 'testCaseNoConf.build.js';
    var actual = grunt.file.read(tmp + actualFile);
    var expected = grunt.file.read(fixtures + actualFile);
    assert.equal(actual, expected, 'task output should equal: ' + actualFile);
  });

});
