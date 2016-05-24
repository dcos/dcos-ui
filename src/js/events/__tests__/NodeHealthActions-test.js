jest.dontMock('../AppDispatcher');
jest.dontMock('../NodeHealthActions');
jest.dontMock('../../config/Config');

import {RequestUtil} from 'mesosphere-shared-reactjs';

var ActionTypes = require('../../constants/ActionTypes');
var AppDispatcher = require('../AppDispatcher');
var Config = require('../../config/Config');
var NodeHealthActions = require('../NodeHealthActions');

describe('NodeHealthActions', function () {

  describe('#fetchNodes', function () {

    beforeEach(function () {
      spyOn(RequestUtil, 'json');
      NodeHealthActions.fetchNodes();
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it('calls #json from the RequestUtil', function () {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it('fetches data from the correct URL', function () {
      expect(this.configuration.url)
        .toEqual(Config.unitHealthAPIPrefix + '/nodes');
    });

    it('dispatches the correct action when successful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_HEALTH_NODES_SUCCESS);
      });

      this.configuration.success({bar: 'bar'});
    });

    it('dispatches the correct action when unsuccessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_HEALTH_NODES_ERROR);
      });

      this.configuration.error({responseJSON: {description: 'bar'}});
    });

  });

  describe('#fetchNode', function () {

    beforeEach(function () {
      spyOn(RequestUtil, 'json');
      NodeHealthActions.fetchNode('foo');
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it('calls #json from the RequestUtil', function () {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it('fetches data from the correct URL', function () {
      expect(this.configuration.url)
        .toEqual(Config.unitHealthAPIPrefix + '/nodes/foo');
    });

    it('dispatches the correct action when successful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_HEALTH_NODE_SUCCESS);
        expect(action.nodeID).toEqual('foo');
      });

      this.configuration.success({bar: 'baz'});
    });

    it('dispatches the correct action when unsuccessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_HEALTH_NODE_ERROR);
        expect(action.nodeID).toEqual('foo');
      });

      this.configuration.error({responseJSON: {description: 'bar'}});
    });

  });

  describe('#fetchNodeUnits', function () {

    beforeEach(function () {
      spyOn(RequestUtil, 'json');
      NodeHealthActions.fetchNodeUnits('foo');
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it('calls #json from the RequestUtil', function () {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it('fetches data from the correct URL', function () {
      expect(this.configuration.url)
        .toEqual(Config.unitHealthAPIPrefix + '/nodes/foo/units');
    });

    it('dispatches the correct action when successful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type)
          .toEqual(ActionTypes.REQUEST_HEALTH_NODE_UNITS_SUCCESS);
        expect(action.nodeID).toEqual('foo');
      });

      this.configuration.success({bar: 'baz'});
    });

    it('dispatches the correct action when unsuccessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type)
          .toEqual(ActionTypes.REQUEST_HEALTH_NODE_UNITS_ERROR);
        expect(action.nodeID).toEqual('foo');
      });

      this.configuration.error({responseJSON: {description: 'bar'}});
    });

  });

  describe('#fetchNodeUnit', function () {

    beforeEach(function () {
      spyOn(RequestUtil, 'json');
      NodeHealthActions.fetchNodeUnit('foo', 'bar');
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it('calls #json from the RequestUtil', function () {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it('fetches data from the correct URL', function () {
      expect(this.configuration.url)
        .toEqual(Config.unitHealthAPIPrefix + '/nodes/foo/units/bar');
    });

    it('dispatches the correct action when successful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type)
          .toEqual(ActionTypes.REQUEST_HEALTH_NODE_UNIT_SUCCESS);
        expect(action.data).toEqual({bar: 'baz'});
      });

      this.configuration.success({bar: 'baz'});
    });

    it('dispatches the correct action when unsuccessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type)
          .toEqual(ActionTypes.REQUEST_HEALTH_NODE_UNIT_ERROR);
        expect(action.nodeID).toEqual('foo');
        expect(action.unitID).toEqual('bar');
      });

      this.configuration.error({responseJSON: {description: 'bar'}});
    });

  });

});
