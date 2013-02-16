/**
 * @fileOverview The dependency task test.
 */

var tasks  = require('../../tasks/grunt_tasks')(),
    cTools = require('grunt-closure-tools')(),
    sinon  = require('sinon'),
    expect = require('chai').expect,
    grunt  = require('grunt'),
    assert = require('chai').assert;


var tmp = 'temp/';
var fixtures = 'test/expected/';

describe('Grunt task :: dependency', function(){

  beforeEach(function() {
  });

  afterEach(function() {
  });

  it('produce the proper result', function(){

    var actualFile = 'deps.js';
    var actual = grunt.file.read(tmp + actualFile);
    var expected = grunt.file.read(fixtures + actualFile);

    assert.equal(actual, expected, 'task output should equal: ' + actualFile);

  });
});
