import PluginTestUtils from 'PluginTestUtils';
import {RequestUtil} from 'mesosphere-shared-reactjs';

let ActionTypes = require('../../constants/ActionTypes');
let Config = require('../../config/Config');
let VirtualNetworksActions = require('../VirtualNetworksActions');
var AppDispatcher = require('../AppDispatcher');

const {virtualNetworksApi} = Config;

describe('VirtualNetworksActions', function () {

  describe('#fetch', function () {

    beforeEach(function () {
      spyOn(RequestUtil, 'json');
      VirtualNetworksActions.fetch();
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it('dispatches the correct action when successful', function () {
      let id = AppDispatcher.register(function (payload) {
        let action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type)
          .toEqual(ActionTypes.REQUEST_VIRTUAL_NETWORKS_SUCCESS);
      });
      this.configuration.success({agents: [], network: {overlays: []}});
    });

    it('requests the right URL', function () {
      VirtualNetworksActions.fetch();
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];

      expect(this.configuration.url)
        .toEqual(virtualNetworksApi + '/state');
    });

    it('dispatches the correct data when successful', function () {
      let id = AppDispatcher.register(function (payload) {
        let action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual({overlays: []});
      });

      this.configuration.success({agents: [], network: {overlays: []}});
    });

    it('dispatches the correct action when unsuccessful', function () {
      let id = AppDispatcher.register(function (payload) {
        let action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type)
          .toEqual(ActionTypes.REQUEST_VIRTUAL_NETWORKS_ERROR);
      });

      this.configuration.error({responseJSON: {description: 'bar'}});
    });

    it('dispatches the correct data when unsuccessful', function () {
      let id = AppDispatcher.register(function (payload) {
        let action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual('bar');
      });

      this.configuration.error({responseJSON: {description: 'bar'}});
    });

  });

});
