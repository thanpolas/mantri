/**
 * @fileOverview The dependency task test.
 */

var tasks  = require('../../tasks/grunt_tasks')(),
    cTools = require('grunt-closure-tools')(),
    sinon  = require('sinon'),
    expect = require('chai').expect,
    configs= require('../fixtures/grunt_configs.fixture'),
    expects= require('../expected/grunt_default.expects'),
    grunt  = require('grunt');

describe('Grunt task :: dependency', function(){

  var spyDeps, stubCmd;

  beforeEach(function() {
    spyDeps = sinon.spy( cTools.depsWriter, 'createCommand' );
    stubCmd = sinon.stub( cTools.helpers, 'runCommands' );
  });

  afterEach(function() {
    spyDeps.restore();
    stubCmd.restore();
  });

  it('produce the proper result', function(){
    var spy = sinon.spy();
    tasks.deps.deps( spy, 'target', 'test/todoApp', 'test/todoApp/deps.js');

    expect( spyDeps.calledOnce ).to.be.true;
    expect( stubCmd.calledOnce ).to.be.true;
    expect( expects.deps.defaults ).to.deep.equal( stubCmd.getCall(0).args[0] );
  });
});
