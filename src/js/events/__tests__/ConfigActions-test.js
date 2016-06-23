jest.dontMock('../AppDispatcher');
jest.dontMock('../../config/Config');
jest.dontMock('../../constants/ActionTypes');

import {Hooks} from 'PluginSDK';
import {RequestUtil} from 'mesosphere-shared-reactjs';

var ActionTypes = require('../../constants/ActionTypes');
var AppDispatcher = require('../AppDispatcher');
var Config = require('../../config/Config');
var ConfigActions = require('../ConfigActions');

describe('ConfigActions', function () {

  describe('#fetchCCID', function () {

    const serviceID = 'test';

    beforeEach(function () {
      spyOn(RequestUtil, 'json');
      ConfigActions.fetchCCID(serviceID);
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it('calls #json from the RequestUtil', function () {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it('fetches data from the correct URL', function () {
      expect(this.configuration.url)
        .toEqual(`${Config.rootUrl}/navstar/lashup/key`);
    });

    it('dispatches the correct action when successful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_CLUSTER_CCID_SUCCESS
        );
        expect(action.data).toEqual({foo: 'bar', baz: 'qux'});
      });

      this.configuration.success({foo: 'bar', baz: 'qux'});
    });

    it('dispatches the correct action when unsucessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_CLUSTER_CCID_ERROR
        );
      });

      this.configuration.error();
    });

  });

});
