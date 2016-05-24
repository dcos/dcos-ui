jest.dontMock('../MesosLogActions');
jest.dontMock('../AppDispatcher');
jest.dontMock('../../constants/ActionTypes');

import {RequestUtil} from 'mesosphere-shared-reactjs';

var MesosLogActions = require('../MesosLogActions');
var ActionTypes = require('../../constants/ActionTypes');
var AppDispatcher = require('../AppDispatcher');

describe('MesosLogActions', function () {

  describe('#requestOffset', function () {

    beforeEach(function () {
      spyOn(RequestUtil, 'json');
      MesosLogActions.requestOffset('foo', 'bar');
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it('calls #json from the RequestUtil', function () {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it('fetches data from the correct URL', function () {
      expect(this.configuration.url)
        .toEqual('/slave/foo/files/read?path=bar&offset=-1');
    });

    it('dispatches the correct action when successful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type)
          .toEqual(ActionTypes.REQUEST_MESOS_LOG_OFFSET_SUCCESS);
      });

      this.configuration.success({data: '', offset: 0});
    });
    it('dispatches the correct information when successful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual({data: '', offset: 0});
        expect(action.path).toEqual('bar');
        expect(action.slaveID).toEqual('foo');
      });

      this.configuration.success({data: '', offset: 0});
    });

    it('dispatches the correct action when unsuccessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type)
          .toEqual(ActionTypes.REQUEST_MESOS_LOG_OFFSET_ERROR);
      });

      this.configuration.error({});
    });

    it('dispatches the correct information when unsuccessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.path).toEqual('bar');
        expect(action.slaveID).toEqual('foo');
      });

      this.configuration.error({});
    });

  });

  describe('#fetchLog', function () {

    beforeEach(function () {
      spyOn(RequestUtil, 'json');
      MesosLogActions.fetchLog('foo', 'bar', 0, 2000);
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it('calls #json from the RequestUtil', function () {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it('fetches data from the correct URL', function () {
      expect(this.configuration.url)
        .toEqual('/slave/foo/files/read?path=bar&offset=0&length=2000');
    });

    it('dispatches the correct action when successful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_MESOS_LOG_SUCCESS);
      });

      this.configuration.success({data: '', offset: 0});
    });
    it('dispatches the correct information when successful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual({data: '', offset: 0});
        expect(action.path).toEqual('bar');
        expect(action.slaveID).toEqual('foo');
      });

      this.configuration.success({data: '', offset: 0});
    });

    it('dispatches the correct action when unsuccessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_MESOS_LOG_ERROR);
      });

      this.configuration.error({});
    });

    it('dispatches the correct information when unsuccessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.path).toEqual('bar');
        expect(action.slaveID).toEqual('foo');
      });

      this.configuration.error({});
    });

  });

  describe('#fetchPreviousLog', function () {

    beforeEach(function () {
      spyOn(RequestUtil, 'json');
      MesosLogActions.fetchPreviousLog('foo', 'bar', 0, 2000);
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it('calls #json from the RequestUtil', function () {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it('fetches data from the correct URL', function () {
      expect(this.configuration.url)
        .toEqual('/slave/foo/files/read?path=bar&offset=0&length=2000');
    });

    it('dispatches the correct action when successful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_PREVIOUS_MESOS_LOG_SUCCESS
        );
      });

      this.configuration.success({data: '', offset: 0});
    });
    it('dispatches the correct information when successful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual({data: '', offset: 0});
        expect(action.path).toEqual('bar');
        expect(action.slaveID).toEqual('foo');
      });

      this.configuration.success({data: '', offset: 0});
    });

    it('dispatches the correct action when unsuccessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_PREVIOUS_MESOS_LOG_ERROR
        );
      });

      this.configuration.error({});
    });

    it('dispatches the correct information when unsuccessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.path).toEqual('bar');
        expect(action.slaveID).toEqual('foo');
      });

      this.configuration.error({});
    });

  });

});
