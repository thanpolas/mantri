/**
 * @fileOverview The build task test.
 */

var tasks  = require('../../tasks/grunt_tasks')(),
    cTools = require('grunt-closure-tools')(),
    sinon  = require('sinon'),
    expect = require('chai').expect,
    configs= require('../fixtures/grunt_configs.fixture'),
    expects= require('../expected/grunt_default.expects'),
    grunt  = require('grunt');

describe('Grunt task :: build :: ', function(){

  var spyDeps, stubCmd;

  beforeEach(function() {
    //spyDeps = sinon.spy( cTools.depsWriter, 'createCommand' );
    //stubCmd = sinon.stub( cTools.helpers, 'runCommands' );
  });

  afterEach(function() {
    //spyDeps.restore();
    //stubCmd.restore();
  });

  it('produce the proper result', function() {
    var spy = sinon.spy();
    tasks.build.build( spy, 'target', 'test/fixtures/case/', 'test/fixtures/case/js/dist/built.js');

    expect( spyDeps.calledOnce ).to.be.true;
    expect( false ).to.be.true;
  });
});
