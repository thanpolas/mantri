/**
 * Test the web api
 */


describe('The web API :: Config :: ', function() {
  var stubWrite;
  var deppy;
  var stubStart;
  var stubAjax;

  beforeEach(function() {
    stubStart = sinon.stub(Deppy.ModuleLoader.prototype, 'start');
    stubWrite = sinon.stub(Deppy.ModuleLoader.prototype, 'writeScript');
    stubAjax  = sinon.stub(window, 'ajax');
    deppy = new Deppy.Core();
  });
  afterEach(function() {
    stubStart.restore();
    stubAjax.restore();
    stubWrite.restore();
  });

  describe('fetching on init :: ', function() {
    it('should not do anything when instanciating on test environment', function(){
      expect( stubWrite.called ).to.be.false;
      expect( stubAjax.called ).to.be.false;
    });
    it('should attempt to fetch the config on demand', function() {
      deppy.fetchConfig();
      expect( stubAjax.calledOnce ).to.be.true;
    });
    it('should fetch the default config file', function() {
      deppy.fetchConfig();
      expect( stubAjax.getCall(0).args[0].url ).to.equal('deppyConf.json');
    });
    it('should not do anything after fetching the config file', function() {
      deppy.fetchConfig();
      expect( stubWrite.called ).to.be.false;
    });
  });

  describe('Options to alter config file :: ', function() {
    var stubDataGet;
    beforeEach(function() {
      stubDataGet = sinon.stub(goog.dom.dataset, 'get');
      stubDataGet.returns('one/foo/bar');
      deppy.fetchConfig();
    });
    afterEach(function() {
      stubDataGet.restore();
    });

    it('should check the script element if there is a config option', function(){
      expect( stubDataGet.getCall(0).args[1] ).to.equal( 'config' );
    });
    it('should load whatever we define as config on script element', function(){
      expect( stubAjax.getCall(0).args[0].url ).to.equal( 'one/foo/bar.json' );
    });

  });

  describe('Directives :: ', function() {

    describe('Third Party requirements', function() {
      beforeEach(function() {
      });
      afterEach(function() {
      });

      it ('should move on even without a config invocation', function() {
        deppy.configFinished();
        expect( stubStart.calledOnce ).to.be.true;
      });

      it('should make the proper amount of calls on writeScript', function() {
        deppy.config(fix.conf.plain);
        // 4 calls for third party
        expect( stubWrite.callCount ).to.equal(4);
      });

      it('should produce the correct docwrite calls at the right sequence', function() {
        deppy.config(fix.conf.plain);
        expect( stubWrite.getCall(0).args[0] ).to.equal('../assets/jquery.min.js');
        expect( stubWrite.getCall(1).args[0] ).to.equal('../assets/handlebars.min.js');
        expect( stubWrite.getCall(2).args[0] ).to.equal('lib/ember-latest.min.js');
        expect( stubWrite.getCall(3).args[0] ).to.equal('../assets/jasmine/jasmine.js');
      });

      it('should have the baseUrl prepended on write calls', function() {
        deppy.config(fix.conf.baseUrl);
        expect( stubWrite.getCall(0).args[0] ).to.equal('js/../assets/jquery.min.js');
        expect( stubWrite.getCall(1).args[0] ).to.equal('js/../assets/handlebars.min.js');
        expect( stubWrite.getCall(2).args[0] ).to.equal('js/lib/ember-latest.min.js');
        expect( stubWrite.getCall(3).args[0] ).to.equal('js/../assets/jasmine/jasmine.js');
      });
    });
  });
});