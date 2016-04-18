jest.dontMock('../index');
jest.dontMock('../hooks');

import PluginTestUtils from 'PluginTestUtils';

let SDK = PluginTestUtils.getSDK('tracking', {enabled: true});
require('../SDK').setSDK(SDK);

var TrackingHooks = require('../hooks');
var DOMUtils = SDK.get('DOMUtils');

describe('TrackingHooks', function () {

  describe('Listeners', function () {

    beforeEach(function () {
      DOMUtils.appendScript = jasmine.createSpy();
    });

    describe('#pluginsConfigured', function () {

      it('appends scripts to the document head if plugin enabled', function () {
        TrackingHooks.initialize();
        SDK.Hooks.doAction('pluginsConfigured');
        expect(DOMUtils.appendScript.callCount).toEqual(1);
      });

    });

  });

});
