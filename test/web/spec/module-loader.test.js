/**
 * Test the web API's module-loader class
 *
 */


describe('The web API :: module-loader :: ', function() {
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

  it('should check for element\'s data-require once.', function() {
    mantri.startApp();
    expect( stubDataGet.calledOnce ).to.be.true;
  });

  it('should check for data-require to find the starting namespace.', function() {
    mantri.startApp();
    expect( stubDataGet.getCall(0).args[1] ).to.equal( 'require' );
  });


  describe('goog.require()', function() {
    var stubConfig;

    beforeEach( function() {
      stubConfig = sinon.stub(Mantri.Config.prototype, 'getEntryPoint');
      stubConfig.returns( null );
    });
    afterEach( function() {
      stubConfig.restore();
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
