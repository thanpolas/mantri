/**
 * Test the web api
 */


describe('The web API', function() {
  var stubWrite;
  var deppy;
  var stubStart;

  beforeEach(function() {
    deppy = new Deppy();
    stubStart = sinon.stub(Deppy.ModuleLoader.prototype, 'start');
    stubWrite = sinon.stub(Deppy.ModuleLoader.prototype, 'writeScript');
  });
  afterEach(function() {
    stubStart.restore();
    stubWrite.restore();
  });

  describe('Config fetching on init', function() {
    it('should not do anything when instanciating', function(){
      expect( stubWrite.called ).to.be.false;
    });
    it('should attempt to fetch the config on demand', function() {
      deppy.fetchConfig();
      expect(stubWrite.calledTwice).to.be.true;
    });
    it('should fetch the default config file', function() {
      deppy.fetchConfig();
      expect(stubWrite.getCall(0).calledWith('deppyConf.js')).to.be.true;
    });
    it('should line up a callback on the DOM after config script tag', function() {
      deppy.fetchConfig();
      expect(stubWrite.getCall(1).calledWith('deppy.configFinished();')).to.be.true;
    });
    it('should not do anything after fetching the config file', function() {
      deppy.fetchConfig();
      expect(stubWrite.calledOnce).to.be.true;
    });
  });

  describe('Options to alter config file', function() {
    it('should load whatever we define as config on script element', function(){
      var stubDataGet = sinon.stub(goog.dom.dataset, 'get');
      stubDataGet.yields('one/foo/bar');

      deppy.fetchConfig();

      expect(stubDataGet.calledWith('config')).to.be.true;
      expect(stubWrite.getCall(0).calledWith('one/foo/bar.js')).to.be.true;

      stubDataGet.restore();
    });
  });

  describe('Configuration file directives', function() {
    var stubStart;
    beforeEach(function() {
      stubStart = sinon.stub(Deppy.ModuleLoader.prototype, 'start');
    });
    afterEach(function() {
      stubStart.restore();
    });

    describe('third party requirements', function() {
      beforeEach(function() {
        deppy.config(fix.conf.plain);
      });
      afterEach(function() {
      });

      it ('should move on even without a config invocation', function() {
        deppy.configFinished();
        expect(stubStart.calledOnce).to.be.true;
      });

      it('should make the proper amount of calls on writeScript', function() {
        // 1 call for config
        // 1 call for config callback
        // 4 calls for third party
        expect(stubWrite.callCount).to.equal(6);
      });
      it('should produce the correct write calls at the right sequence', function() {
        expect(writeScript.getCall(2)).to.equal('../assets/jquery.min.js');
        expect(writeScript.getCall(3)).to.equal('../assets/handlebars.min.js');
        expect(writeScript.getCall(4)).to.equal('lib/ember-latest.min.js');
        expect(writeScript.getCall(5)).to.equal('../assets/jasmine/jasmine.js');
      });
    describe('baseUrl option', function() {
      it('should have the baseUrl prepended on write calls', function() {
        deppy.config(fix.conf.baseUrl);
        expect(writeScript.getCall(2)).to.equal('js/../assets/jquery.min.js');
        expect(writeScript.getCall(3)).to.equal('js/../assets/handlebars.min.js');
        expect(writeScript.getCall(4)).to.equal('js/lib/ember-latest.min.js');
        expect(writeScript.getCall(5)).to.equal('js/../assets/jasmine/jasmine.js');
      });
    });
  });
});
