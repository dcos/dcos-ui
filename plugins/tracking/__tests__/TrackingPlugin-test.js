jest.dontMock('../index');
jest.dontMock('../hooks');

jest.setMock('react-router', {
  HashLocation: {
    getCurrentPath() { return '/foo'; },
    addChangeListener() {}
  }
});

const PluginTestUtils = require('PluginTestUtils');

const TrackingHooks = require('../hooks');

let SDK = PluginTestUtils.getSDK('tracking', {enabled: true});
require('../SDK').setSDK(SDK);

const DOMUtils = SDK.get('DOMUtils');

describe('TrackingHooks', function () {

  describe('Listeners', function () {

    beforeEach(function () {
      DOMUtils.appendScript = jasmine.createSpy();
    });

    describe('#pluginsConfigured', function () {

      it('appends scripts to the document head if plugin enabled', function () {
        TrackingHooks.initialize();
        SDK.Hooks.doAction('pluginsConfigured');
        expect(DOMUtils.appendScript.calls.count()).toEqual(1);
      });

    });

  });

});
