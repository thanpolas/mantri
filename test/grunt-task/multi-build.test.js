/**
 * @fileOverview The build task test.
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


describe('13. Build multiple modules :: ', function(){

  var spyDeps, stubCmd;
  beforeEach(function() {
  });

  afterEach(function() {
  });

  it('13.1 produce proper files and compiled output', function() {

    var coreFile = 'app-mult-build-core.min.js';
    var modOneFile = 'app-mult-build-module-one.min.js';
    var modTwoFile = 'app-mult-build-module-two.min.js';
    
    var files = [coreFile, modOneFile, modTwoFile];

    var actual, expected;
    files.forEach(function(file){
      actual = grunt.file.read(tmp + file);
      expected = grunt.file.read(fixtures + file);
      assert.equal(actual, expected, 'build output should equal: ' + file);
    });
  });
});
