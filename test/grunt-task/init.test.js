/**
 * @fileOverview The dependency task test.
 */

var tasks  = require('../../tasks/grunt_mantri')(),
    cTools = require('grunt-closure-tools')(),
    sinon  = require('sinon'),
    expect = require('chai').expect,
    grunt  = require('grunt'),
    assert = require('chai').assert;


var tmp = 'temp/';
var fixtures = 'dist/';

describe('Grunt task :: init', function(){

  beforeEach(function() {
  });

  afterEach(function() {
  });

  it('should copy the mantri.web.js file', function(){
    var actualFile = 'mantri.web.js';
    var actual = grunt.file.read(tmp + actualFile);
    var expected = grunt.file.read(fixtures + actualFile);
    assert.equal(actual, expected, 'task output should equal: ' + actualFile);
  });
  it('should copy the mantriConf.json file', function(){
    var actualFile = 'mantriConf.json';
    var actual = grunt.file.read(tmp + actualFile);
    var expected = grunt.file.read(fixtures + actualFile);
    assert.equal(actual, expected, 'task output should equal: ' + actualFile);
  });

});
