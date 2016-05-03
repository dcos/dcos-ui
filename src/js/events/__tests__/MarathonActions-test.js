jest.dontMock('../AppDispatcher');
jest.dontMock('../UnitHealthActions');
jest.dontMock('../../config/Config');
jest.dontMock('../../constants/ActionTypes');

var ActionTypes = require('../../constants/ActionTypes');
var AppDispatcher = require('../AppDispatcher');
var Config = require('../../config/Config');
var RequestUtil = require('../../utils/RequestUtil');
var MarathonActions = require('../MarathonActions');

describe('MarathonActions', function () {

  describe('#fetchGroups', function () {

    beforeEach(function () {
      spyOn(RequestUtil, 'json');
      MarathonActions.fetchGroups();
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it('calls #json from the RequestUtil', function () {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it('fetches data from the correct URL', function () {
      expect(this.configuration.url)
        .toEqual(`${Config.rootUrl}/marathon/v2/groups`);
    });

    it('dispatches the correct action when successful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_MARATHON_GROUPS_SUCCESS);
      });

      this.configuration.success({
        apps: [],
        dependencies: [],
        groups: [],
        id: '/',
        version: '2016-05-02T16:07:32.583Z'
      });
    });

    it('dispatches the correct action when unsucessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_MARATHON_GROUPS_ERROR);
      });

      this.configuration.error({message: 'error'});
    });

  });

  describe('#fetchServiceVersions', function () {

    const serviceId = 'test';

    beforeEach(function () {
      spyOn(RequestUtil, 'json');
      MarathonActions.fetchServiceVersions(serviceId);
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it('calls #json from the RequestUtil', function () {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it('fetches data from the correct URL', function () {
      expect(this.configuration.url)
        .toEqual(`${Config.rootUrl}/marathon/v2/apps/${serviceId}/versions`);
    });

    it('dispatches the correct action when successful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_MARATHON_SERVICE_VERSIONS_SUCCESS
        );
      });

      this.configuration.success({
        serviceId,
        versions: ['2016-05-02T16:07:32.583Z']
      });
    });

    it('dispatches the correct action when unsucessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_MARATHON_SERVICE_VERSIONS_ERROR
        );
      });

      this.configuration.error({message: 'error'});
    });

  });

});
