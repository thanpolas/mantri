/**
 * Test the web API's module-loader class
 *
 */


describe('The web API :: module-loader :: ', function() {
  var stubWrite;
  var deppy;
  var stubDataGet;

  beforeEach(function() {
    stubWrite = sinon.stub(Deppy.ModuleLoader.prototype, 'writeScript');
    stubDataGet = sinon.stub(goog.dom.dataset, 'get');

    deppy = new Deppy.Core();
    //deppy.configFinished();
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
      stubConfig = sinon.stub(Deppy.Config.prototype, 'getEntryPoint');
      stubConfig.returns( null );
    });
    afterEach( function() {
      stubConfig.restore();
      stubRequire.restore();
    });
    it('should call goog.require() once', function() {
      deppy.startApp();
      expect( stubRequire.calledOnce ).to.be.true;
    });
    it('should call goog.require() with the default namespace', function() {
      deppy.startApp();
      expect( stubRequire.getCall(0).args[0] ).to.equal( 'app' );
    });
    it('should call goog.require() with the defined namespace', function() {
      stubDataGet.returns( 'custom.namespace' );
      deppy.startApp();
      expect( stubRequire.getCall(0).args[0] ).to.equal( 'custom.namespace' );
    });
  });

});
