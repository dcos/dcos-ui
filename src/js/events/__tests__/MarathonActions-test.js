jest.dontMock('../AppDispatcher');
jest.dontMock('../../config/Config');
jest.dontMock('../../constants/ActionTypes');

var ActionTypes = require('../../constants/ActionTypes');
var AppDispatcher = require('../AppDispatcher');
var Config = require('../../config/Config');
var RequestUtil = require('../../utils/RequestUtil');
var MarathonActions = require('../MarathonActions');

describe('MarathonActions', function () {

  describe('#fetchDeployments', function () {

    beforeEach(function () {
      spyOn(RequestUtil, 'json');
      MarathonActions.fetchDeployments();
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it('calls #json from the RequestUtil', function () {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it('fetches data from the correct URL', function () {
      expect(this.configuration.url)
        .toEqual(`${Config.rootUrl}/marathon/v2/deployments`);
    });

    it('dispatches the correct action when successful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_MARATHON_DEPLOYMENTS_SUCCESS);
      });

      this.configuration.success({
        apps: [],
        dependencies: [],
        groups: [],
        id: '/',
        version: '2001-01-01T01:01:01.001Z'
      });
    });

    it('dispatches the correct action when unsucessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_MARATHON_DEPLOYMENTS_ERROR);
      });

      this.configuration.error({message: 'error'});
    });

  });

});
