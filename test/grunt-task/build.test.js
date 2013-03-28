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


describe('Grunt task :: build :: ', function(){

  var spyDeps, stubCmd;
  beforeEach(function() {
  });

  afterEach(function() {
  });

  it('produce the proper result', function() {

    var actualFile = 'testCase.build.js';
    var actual = grunt.file.read(tmp + actualFile);
    var expected = grunt.file.read(fixtures + actualFile);

    assert.equal(actual, expected, 'task output should equal: ' + actualFile);

  });
});
