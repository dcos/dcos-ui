jest.dontMock('../AppDispatcher');
jest.dontMock('../UnitHealthActions');
jest.dontMock('../../config/Config');
jest.dontMock('../../constants/ActionTypes');

import {RequestUtil} from 'mesosphere-shared-reactjs';

var ActionTypes = require('../../constants/ActionTypes');
var AppDispatcher = require('../AppDispatcher');
var Config = require('../../config/Config');
var UnitHealthActions = require('../UnitHealthActions');

describe('UnitHealthActions', function () {

  describe('#fetchUnits', function () {

    beforeEach(function () {
      spyOn(RequestUtil, 'json');
      UnitHealthActions.fetchUnits();
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it('calls #json from the RequestUtil', function () {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it('fetches data from the correct URL', function () {
      expect(this.configuration.url)
        .toEqual(Config.unitHealthAPIPrefix + '/units');
    });

    it('dispatches the correct action when successful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_HEALTH_UNITS_SUCCESS);
      });

      this.configuration.success({bar: 'bar'});
    });

    it('dispatches the correct action when unsucessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_HEALTH_UNITS_ERROR);
      });

      this.configuration.error({responseJSON: {description: 'bar'}});
    });

  });

  describe('#fetchUnit', function () {

    beforeEach(function () {
      spyOn(RequestUtil, 'json');
      UnitHealthActions.fetchUnit('foo');
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it('calls #json from the RequestUtil', function () {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it('fetches data from the correct URL', function () {
      expect(this.configuration.url)
        .toEqual(Config.unitHealthAPIPrefix + '/units/foo');
    });

    it('dispatches the correct action when successful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_HEALTH_UNIT_SUCCESS);
        expect(action.unitID).toEqual('foo');
      });

      this.configuration.success({bar: 'baz'});
    });

    it('dispatches the correct action when unsucessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_HEALTH_UNIT_ERROR);
        expect(action.unitID).toEqual('foo');
      });

      this.configuration.error({responseJSON: {description: 'bar'}});
    });

  });

  describe('#fetchUnitNodes', function () {

    beforeEach(function () {
      spyOn(RequestUtil, 'json');
      UnitHealthActions.fetchUnitNodes('foo');
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it('calls #json from the RequestUtil', function () {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it('fetches data from the correct URL', function () {
      expect(this.configuration.url)
        .toEqual(Config.unitHealthAPIPrefix + '/units/foo/nodes');
    });

    it('dispatches the correct action when successful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type)
          .toEqual(ActionTypes.REQUEST_HEALTH_UNIT_NODES_SUCCESS);
        expect(action.unitID).toEqual('foo');
      });

      this.configuration.success({bar: 'baz'});
    });

    it('dispatches the correct action when unsucessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type)
          .toEqual(ActionTypes.REQUEST_HEALTH_UNIT_NODES_ERROR);
        expect(action.unitID).toEqual('foo');
      });

      this.configuration.error({responseJSON: {description: 'bar'}});
    });

  });

  describe('#fetchUnitNode', function () {

    beforeEach(function () {
      spyOn(RequestUtil, 'json');
      UnitHealthActions.fetchUnitNode('foo', 'bar');
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it('calls #json from the RequestUtil', function () {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it('fetches data from the correct URL', function () {
      expect(this.configuration.url)
        .toEqual(Config.unitHealthAPIPrefix + '/units/foo/nodes/bar');
    });

    it('dispatches the correct action when successful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type)
          .toEqual(ActionTypes.REQUEST_HEALTH_UNIT_NODE_SUCCESS);
        expect(action.data).toEqual({bar: 'baz'});
      });

      this.configuration.success({bar: 'baz'});
    });

    it('dispatches the correct action when unsucessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type)
          .toEqual(ActionTypes.REQUEST_HEALTH_UNIT_NODE_ERROR);
        expect(action.unitID).toEqual('foo');
        expect(action.nodeID).toEqual('bar');
      });

      this.configuration.error({responseJSON: {description: 'bar'}});
    });

  });

});
