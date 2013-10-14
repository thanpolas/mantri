/**
 * @fileOverview The dependency task test.
 */

var tasks  = require('../../tasks/grunt-mantri'),
    cTools = require('grunt-closure-tools'),
    sinon  = require('sinon'),
    expect = require('chai').expect,
    grunt  = require('grunt'),
    assert = require('chai').assert;


var tmp = 'temp/';
var fixtures = 'dist/';

describe('12. Grunt task :: init', function(){

  beforeEach(function() {
  });

  afterEach(function() {
  });

  it('12.1 should copy the mantri.web.js file', function(){
    var actualFile = 'mantri.web.js';
    var actual = grunt.file.read(tmp + actualFile);
    var expected = grunt.file.read(fixtures + actualFile);
    assert.equal(actual, expected, 'task output should equal: ' + actualFile);
  });
  it('12.2 should copy the mantriConf.json file', function(){
    var actualFile = 'mantriConf.json';
    var actual = grunt.file.read(tmp + actualFile);
    var expected = grunt.file.read(fixtures + actualFile);
    assert.equal(actual, expected, 'task output should equal: ' + actualFile);
  });

});
