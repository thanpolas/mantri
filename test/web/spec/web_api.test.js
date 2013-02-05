/**
 * Test the web api
 */


describe('The web API', function() {
  var ssNew;
  var stub;
  var userFix = ssd.test.fixture.userOne;
  var event = ssd.test.fixture.event;

  beforeEach(function() {
    ssNew = new ss();
    ssNew();
    stub = sinon.stub(ssNew.net, 'sync');
  });
  afterEach(function() {
    stub.restore();
  });

      describe('maybe a bit more context here', function() {

        it('should run here few assertions', function() {
          expect(true).to.be.true;
        });

      });
