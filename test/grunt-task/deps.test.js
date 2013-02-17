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

  it('should produce the right result for project == root', function(){

    var actualFile = 'deps.js';
    var actual = grunt.file.read(tmp + actualFile);
    var expected = grunt.file.read(fixtures + actualFile);

    // cheat a little, first line is the depsWriter.py full path declaration.
    // this breaks tests in each different setup.
    //
    // so, remove first line from both files
    actual = actual.split('\n').splice(1).join('\n');
    expected = expected.split('\n').splice(1).join('\n');

    assert.equal(actual, expected, 'task output should equal: ' + actualFile);

  });
  it('should produce the right result for project != root', function(){

    var actualFile = 'deps.two.js';
    var actual = grunt.file.read(tmp + actualFile);
    var expected = grunt.file.read(fixtures + actualFile);

    // cheat a little, first line is the depsWriter.py full path declaration.
    // this breaks tests in each different setup.
    //
    // so, remove first line from both files
    actual = actual.split('\n').splice(1).join('\n');
    expected = expected.split('\n').splice(1).join('\n');

    assert.equal(actual, expected, 'task output should equal: ' + actualFile);

  });

});
