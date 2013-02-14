/**
 * Test the web API's path handling methods
 *
 */


describe('The web API :: Proper paths :: ', function() {
  var stubWrite,
      mantri,
      stubDataGet,
      stubAjax;

  beforeEach(function() {
    stubWrite = sinon.stub(Mantri.ModuleLoader.prototype, 'writeScript');
    stubDataGet = sinon.stub(goog.dom.dataset, 'get');
    stubAjax  = sinon.stub(window, 'ajax');


    mantri = new Mantri.Core();
    //mantri.configFinished();
  });

  afterEach(function() {
    stubWrite.restore();
    stubDataGet.restore();
    stubAjax.restore();
  });

  describe('Config and vendor deps :: ', function() {

    beforeEach( function() {
    });
    afterEach( function() {
    });

    it('should require vendor libs, using correct paths (we are 2' +
      ' folders deep), at the right sequence', function() {
      stubAjax.yieldsTo('success', fix.conf.plain);
      mantri.fetchConfig();
      expect( stubWrite.getCall(0).args[0] ).to.equal('../../../assets/jquery.min.js');
      expect( stubWrite.getCall(1).args[0] ).to.equal('../../../assets/handlebars.min.js');
      expect( stubWrite.getCall(2).args[0] ).to.equal('../../lib/ember-latest.min.js');
      expect( stubWrite.getCall(3).args[0] ).to.equal('../../../assets/jasmine/jasmine.js');
    });

    it('should prepend the baseUrl on write calls and compensate for paths', function() {
      stubAjax.yieldsTo('success', fix.conf.baseUrl);
      mantri.fetchConfig();
      expect( stubWrite.getCall(0).args[0] ).to.equal('../../js/../assets/jquery.min.js');
      expect( stubWrite.getCall(1).args[0] ).to.equal('../../js/../assets/handlebars.min.js');
      expect( stubWrite.getCall(2).args[0] ).to.equal('../../js/lib/ember-latest.min.js');
      expect( stubWrite.getCall(3).args[0] ).to.equal('../../js/../assets/jasmine/jasmine.js');
    });

    it('should treat an absolute baseUrl properly, ignoring the current path.', function() {
      stubAjax.yieldsTo('success', fix.conf.baseUrlAbsolute);
      mantri.fetchConfig();
      expect( stubWrite.getCall(0).args[0] ).to.equal('/js/../assets/jquery.min.js');
      expect( stubWrite.getCall(1).args[0] ).to.equal('/js/../assets/handlebars.min.js');
      expect( stubWrite.getCall(2).args[0] ).to.equal('/js/lib/ember-latest.min.js');
      expect( stubWrite.getCall(3).args[0] ).to.equal('/js/../assets/jasmine/jasmine.js');
    });


    it('should compensate for paths even if alternative config file is defined', function() {

      stubAjax.yieldsTo('success', fix.conf.plain);
      stubDataGet.returns('one/foo/bar');
      mantri.fetchConfig();

      expect( stubWrite.getCall(0).args[0] ).to.equal('../../../assets/jquery.min.js');
      expect( stubWrite.getCall(1).args[0] ).to.equal('../../../assets/handlebars.min.js');
      expect( stubWrite.getCall(2).args[0] ).to.equal('../../lib/ember-latest.min.js');
      expect( stubWrite.getCall(3).args[0] ).to.equal('../../../assets/jasmine/jasmine.js');
    });



  });

});
