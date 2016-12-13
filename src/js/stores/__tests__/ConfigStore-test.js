jest.dontMock('../../constants/EventTypes');
jest.dontMock('../ConfigStore');
jest.dontMock('../../constants/EventTypes');

const EventTypes = require('../../constants/EventTypes');
const ConfigStore = require('../ConfigStore');
const ConfigActions = require('../../events/ConfigActions');

describe('ConfigStore', function () {

  describe('#fetchBootstrapConfig', function () {
    it('hands off the call to ConfigActions', function () {
      spyOn(ConfigActions, 'fetchBootstrapConfig');
      ConfigStore.fetchBootstrapConfig();
      expect(ConfigActions.fetchBootstrapConfig).toHaveBeenCalled();
    });
  });

  describe('#processBootstrapSuccess', function () {
    beforeEach(function () {
      this.handler = jest.genMockFunction();
      ConfigStore.once(
        EventTypes.BOOTSTRAP_CONFIG_SUCCESS, this.handler
      );
      ConfigStore.processBootstrapConfigSuccess({security: 'permissive'});
    });

    it('should emit an event', function () {
      expect(this.handler).toHaveBeenCalled();
    });

    it('should return stored info', function () {
      expect(ConfigStore.get('bootstrapConfig')).toEqual({
        security: 'permissive'
      });
    });
  });

  describe('#processCCIDSuccess', function () {

    beforeEach(function () {
      this.handler = jest.genMockFunction();
      ConfigStore.once(
        EventTypes.CLUSTER_CCID_SUCCESS, this.handler
      );
      ConfigStore.processCCIDSuccess({foo: 'bar'});
    });

    it('should emit an event', function () {
      expect(this.handler).toBeCalled();
    });

    it('should return stored info', function () {
      expect(ConfigStore.get('ccid')).toEqual({foo: 'bar'});
    });

  });

});
