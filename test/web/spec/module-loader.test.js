/**
 * Test the web API's module-loader class
 *
 */


describe('2. The web API :: module-loader :: ', function() {
  var stubWrite;
  var mantri;
  var stubDataGet;
  var stubRequire;

  beforeEach(function() {
    stubWrite = sinon.stub(Mantri.ModuleLoader.prototype, 'writeScript');
    stubDataGet = sinon.stub(goog.dom.dataset, 'get');
    stubRequire = sinon.stub(goog, 'require');

    mantri = new Mantri.Core();
    //mantri.configFinished();
  });
  afterEach(function() {
    stubWrite.restore();
    stubDataGet.restore();
    stubRequire.restore();
  });

  it('2.1 should check for element\'s data-require once.', function() {
    mantri.startApp();
    expect( stubDataGet.calledOnce ).to.be.true;
  });

  it('2.2 should check for data-require to find the starting namespace.', function() {
    mantri.startApp();
    expect( stubDataGet.getCall(0).args[1] ).to.equal( 'require' );
  });


  describe('2.3 goog.require()', function() {
    var stubConfig;

    beforeEach( function() {
      stubConfig = sinon.stub(Mantri.Config.prototype, 'getEntryPoint');
      stubConfig.returns( null );
    });
    afterEach( function() {
      stubConfig.restore();
    });

    it('2.3.1 should call goog.require() once', function() {
      mantri.startApp();
      expect( stubRequire.calledOnce ).to.be.true;
    });
    it('2.3.2 should call goog.require() with the default namespace', function() {
      mantri.startApp();
      expect( stubRequire.getCall(0).args[0] ).to.equal( 'app' );
    });
    it('2.3.3 should call goog.require() with the defined namespace', function() {
      stubDataGet.returns( 'custom.namespace' );
      mantri.startApp();
      expect( stubRequire.getCall(0).args[0] ).to.equal( 'custom.namespace' );
    });
  });

});
