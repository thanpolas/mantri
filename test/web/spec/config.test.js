/**
 * Test the web api
 */


describe('1. The web API :: Config :: ', function() {
  var stubWrite;
  var stubDataGet;
  var mantri;
  var stubFetchDeps;
  var stubAjax;

  beforeEach(function() {
    stubFetchDeps = sinon.stub(Mantri.ModuleLoader.prototype, 'fetchDeps');
    stubWrite = sinon.stub(Mantri.ModuleLoader.prototype, 'writeScript');
    stubDataGet = sinon.stub(goog.dom.dataset, 'get');
    stubAjax  = sinon.stub(window.jQuery, 'ajax');
    mantri = new Mantri.Core();
  });
  afterEach(function() {
    stubFetchDeps.restore();
    stubDataGet.restore();
    stubAjax.restore();
    stubWrite.restore();
  });

  describe('1.1 fetching on init :: ', function() {
    it('should not do anything when instanciating on test environment', function(){
      expect( stubWrite.called ).to.be.false;
      expect( stubAjax.called ).to.be.false;
    });

    it('1.1.1 should check for element\'s data-config once', function() {
      mantri.fetchConfig();
      expect( stubDataGet.calledOnce ).to.be.true;
    });

    it('1.1.2 should check for data-config to find an alternative config file.', function() {
      mantri.fetchConfig();
      expect( stubDataGet.getCall(0).args[1] ).to.equal( 'config' );
    });

    it('1.1.3 should attempt to fetch the config on demand', function() {
      mantri.fetchConfig();
      expect( stubAjax.calledOnce ).to.be.true;
    });

    it('1.1.4 should fetch the default config file', function() {
      mantri.fetchConfig();
      expect( stubAjax.getCall(0).args[0].url ).to.equal('/mantriConf.json');
    });

    it('1.1.5 should not do anything after fetching the config file', function() {
      mantri.fetchConfig();
      expect( stubWrite.called ).to.be.false;
    });
  });

  describe('1.2 Options to alter config file :: ', function() {
    beforeEach(function() {
      stubDataGet.returns('one/foo/bar');
      mantri.fetchConfig();
    });
    afterEach(function() {
    });

    it('1.2.1 should check the script element if there is a config option', function(){
      expect( stubDataGet.getCall(0).args[1] ).to.equal( 'config' );
    });
    it('1.2.2 should load whatever we define as config on script element', function(){
      expect( stubAjax.getCall(0).args[0].url ).to.equal( 'one/foo/bar.json' );
    });

  });

  describe('1.3 Directives :: ', function() {

    describe('1.3.1 Third Party requirements', function() {
      beforeEach(function() {
      });
      afterEach(function() {
      });

      it ('1.3.1.1 should move on even without a config invocation', function() {
        mantri.configFinished();
        expect( stubFetchDeps.calledOnce ).to.be.true;
      });

      it('1.3.1.1 should make the proper amount of calls on writeScript', function() {
        mantri.config(fix.conf.plain);
        // 4 calls for third party
        expect( stubWrite.callCount ).to.equal(4);
      });

    });
  });
});
