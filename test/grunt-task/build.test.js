/**
 * @fileOverview The build task test.
 */

var tasks  = require('../../tasks/grunt_tasks')(),
    cTools = require('grunt-closure-tools')(),
    sinon  = require('sinon'),
    expect = require('chai').expect,
    assert = require('chai').assert,
    configs= require('../fixtures/grunt_configs.fixture'),
    expects= require('../expected/grunt_default.expects'),
    grunt  = require('grunt');

describe('Grunt task :: build :: ', function(){

  var spyDeps, stubCmd;
  beforeEach(function() {
  });

  afterEach(function() {
  });

  it('produce the proper result', function() {

    var actual = grunt.file.read('test/case/js/dist/build.js');
    var expected = grunt.file.read('test/expected/testCase.build.js');
    assert.equal(expected, actual, 'Should produce identical build file');

  });
});
