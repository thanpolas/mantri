/**
 * Test the web API's path handling methods
 *
 */

describe('3. The web API :: Proper paths :: ', function() {
  var stubWrite,
      mantri,
      stubDataGet,
      stubAjax;

  beforeEach(function() {
    stubDataGet = sinon.stub(goog.dom.dataset, 'get');
    stubAjax  = sinon.stub(window.jQuery, 'ajax');


    mantri = new Mantri.Core();
    //mantri.configFinished();
  });

  afterEach(function() {
    stubDataGet.restore();
    stubAjax.restore();
  });

  function buildScript( src ) {
    return '<script type="text/javascript" src="' +
      src +
      '"></script>';
  }

  describe('3.1 Config and vendor deps :: ', function() {

    beforeEach( function() {
      stubWrite = sinon.stub(document, 'write');
    });
    afterEach( function() {
      stubWrite.restore();
    });

    it('3.1.1 should require vendor libs, using correct paths (we are 2' +
      ' folders deep), at the right sequence', function() {
      stubAjax.yieldsTo('success', fix.conf.plain);
      mantri.fetchConfig();
      expect( stubWrite.getCall(0).args[0] ).to.equal( buildScript( '../../../assets/jquery.min.js' ));
      expect( stubWrite.getCall(1).args[0] ).to.equal( buildScript( '../../../assets/handlebars.min.js' ));
      expect( stubWrite.getCall(2).args[0] ).to.equal( buildScript( '../../lib/ember-latest.min.js' ));
      expect( stubWrite.getCall(3).args[0] ).to.equal( buildScript( '../../../assets/jasmine/jasmine.js' ));
    });

    it('3.1.2 should prepend the baseUrl on write calls and compensate for paths', function() {
      stubAjax.yieldsTo('success', fix.conf.baseUrl);
      mantri.fetchConfig();

      expect( stubWrite.getCall(0).args[0] ).to.equal( buildScript( '../../js/../assets/jquery.min.js' ));
      expect( stubWrite.getCall(1).args[0] ).to.equal( buildScript( '../../js/../assets/handlebars.min.js' ));
      expect( stubWrite.getCall(2).args[0] ).to.equal( buildScript( '../../js/lib/ember-latest.min.js' ));
      expect( stubWrite.getCall(3).args[0] ).to.equal( buildScript( '../../js/../assets/jasmine/jasmine.js' ));
    });

    it('3.2.3 should treat an absolute baseUrl properly, ignoring the current path.', function() {
      stubAjax.yieldsTo('success', fix.conf.baseUrlAbsolute);
      mantri.fetchConfig();
      expect( stubWrite.getCall(0).args[0] ).to.equal( buildScript( '/js/../assets/jquery.min.js' ));
      expect( stubWrite.getCall(1).args[0] ).to.equal( buildScript( '/js/../assets/handlebars.min.js' ));
      expect( stubWrite.getCall(2).args[0] ).to.equal( buildScript( '/js/lib/ember-latest.min.js' ));
      expect( stubWrite.getCall(3).args[0] ).to.equal( buildScript( '/js/../assets/jasmine/jasmine.js' ));
    });

    it('3.2.4 should treat a path starting with dot slash properly, ignoring the current path.', function() {
      stubAjax.yieldsTo('success', fix.conf.baseUrlDotSlash);
      mantri.fetchConfig();
      expect( stubWrite.getCall(0).args[0] ).to.equal( buildScript( './../assets/jquery.min.js' ));
      expect( stubWrite.getCall(1).args[0] ).to.equal( buildScript( './../assets/handlebars.min.js' ));
      expect( stubWrite.getCall(2).args[0] ).to.equal( buildScript( './lib/ember-latest.min.js' ));
      expect( stubWrite.getCall(3).args[0] ).to.equal( buildScript( './../assets/jasmine/jasmine.js' ));
    });




    it('3.2.5 should compensate for paths even if alternative config file is defined', function() {

      stubAjax.yieldsTo('success', fix.conf.plain);
      stubDataGet.returns('one/foo/bar');
      mantri.fetchConfig();

      expect( stubWrite.getCall(0).args[0] ).to.equal( buildScript( '../../../assets/jquery.min.js' ));
      expect( stubWrite.getCall(1).args[0] ).to.equal( buildScript( '../../../assets/handlebars.min.js' ));
      expect( stubWrite.getCall(2).args[0] ).to.equal( buildScript( '../../lib/ember-latest.min.js' ));
      expect( stubWrite.getCall(3).args[0] ).to.equal( buildScript( '../../../assets/jasmine/jasmine.js' ));
    });



  });

});
