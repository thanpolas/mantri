/**
 * Test the web API's module-loader class
 *
 */


describe('The web API :: module-loader :: ', function() {
  var stubWrite;
  var mantri;
  var stubDataGet;

  beforeEach(function() {
    stubWrite = sinon.stub(Mantri.ModuleLoader.prototype, 'writeScript');
    stubDataGet = sinon.stub(goog.dom.dataset, 'get');

    mantri = new Mantri.Core();
    //mantri.configFinished();
  });
  afterEach(function() {
    stubWrite.restore();
    stubDataGet.restore();
  });

  describe('goog.require()', function() {
    var stubRequire,
        stubConfig;

    beforeEach( function() {
      stubRequire = sinon.stub(goog, 'require');
      stubConfig = sinon.stub(Mantri.Config.prototype, 'getEntryPoint');
      stubConfig.returns( null );
    });
    afterEach( function() {
      stubConfig.restore();
      stubRequire.restore();
    });
    it('should call goog.require() once', function() {
      mantri.startApp();
      expect( stubRequire.calledOnce ).to.be.true;
    });
    it('should call goog.require() with the default namespace', function() {
      mantri.startApp();
      expect( stubRequire.getCall(0).args[0] ).to.equal( 'app' );
    });
    it('should call goog.require() with the defined namespace', function() {
      stubDataGet.returns( 'custom.namespace' );
      mantri.startApp();
      expect( stubRequire.getCall(0).args[0] ).to.equal( 'custom.namespace' );
    });
  });

});
