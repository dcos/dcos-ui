jest.dontMock('../MesosLogStore');
jest.dontMock('../../config/Config');
jest.dontMock('../../events/AppDispatcher');
jest.dontMock('../../events/MesosLogActions');
jest.dontMock('../../mixins/GetSetMixin');
jest.dontMock('../../structs/LogBuffer');
jest.dontMock('../../structs/Item');
jest.dontMock('../../structs/List');
jest.dontMock('../../utils/Util');

import {RequestUtil} from 'mesosphere-shared-reactjs';

var ActionTypes = require('../../constants/ActionTypes');
var AppDispatcher = require('../../events/AppDispatcher');
var EventTypes = require('../../constants/EventTypes');
var LogBuffer = require('../../structs/LogBuffer');
var MesosLogActions = require('../../events/MesosLogActions');
var MesosLogStore = require('../MesosLogStore');

describe('MesosLogStore', function () {

  beforeEach(function () {
    this.requestFn = RequestUtil.json;
    RequestUtil.json = jasmine.createSpy();
    MesosLogStore.startTailing('foo', '/bar');
  });

  afterEach(function () {
    RequestUtil.json = this.requestFn;
  });

  describe('#startTailing', function () {

    it('should return an instance of LogBuffer', function () {
      var logBuffer = MesosLogStore.get('/bar');
      expect(logBuffer instanceof LogBuffer).toBeTruthy();
    });

  });

  describe('#stopTailing', function () {

    it('should return an instance of LogBuffer', function () {
      MesosLogStore.stopTailing('/bar');
      var logBuffer = MesosLogStore.get('/bar');
      expect(logBuffer).toEqual(undefined);
    });

  });

  describe('#getPreviousLogs', function () {

    beforeEach(function () {
      this.MockMesosLogStore = {
        get: function (key) {
          if (key === 'exists') {
            return {
              getStart: function () { return 100; }
            };
          }
        }
      };

      MesosLogActions.fetchPreviousLog = jasmine.createSpy();
    });

    it('does nothing if logBuffer doesn\'t exist', function () {
      MesosLogStore.getPreviousLogs.call(
        this.MockMesosLogStore, 'slaveID', 'nonExistantPath'
      );

      expect(MesosLogActions.fetchPreviousLog).not.toHaveBeenCalled();
    });

    it('does nothing if already at the beginning of history', function () {
      var MockMesosLogStore = {
        get: function (key) {
          if (key === 'exists') {
            return {
              getStart: function () { return 0; }
            };
          }
        }
      };

      MesosLogStore.getPreviousLogs.call(
        MockMesosLogStore, 'slaveID', 'exists'
      );

      expect(MesosLogActions.fetchPreviousLog).not.toHaveBeenCalled();
    });

    it('calls #fetchPreviousLog with the correct args', function () {
      MesosLogStore.getPreviousLogs.call(
        this.MockMesosLogStore, 'slaveID', 'exists'
      );

      expect(MesosLogActions.fetchPreviousLog).toHaveBeenCalledWith(
        'slaveID', 'exists', 0, 50000
      );
    });

  });

  describe('#processLogEntry', function () {

    beforeEach(function () {
      // First item will be used to initialize
      MesosLogStore.processOffset('foo', '/bar', {data: '', offset: 100});
      // Two next processes will be stored
      MesosLogStore.processLogEntry('foo', '/bar', {data: 'foo', offset: 100});
      MesosLogStore.processLogEntry('foo', '/bar', {data: 'bar', offset: 103});
      this.logBuffer = MesosLogStore.get('/bar');
    });

    it('should return all of the log items it was given', function () {
      let items = this.logBuffer.getItems();
      expect(items.length).toEqual(2);
    });

    it('should return the full log of items it was given', function () {
      expect(this.logBuffer.getFullLog()).toEqual('foobar');
    });

    it('should call the fetch log 4 times', function () {
      jest.runAllTimers();
      expect(RequestUtil.json.calls.count()).toEqual(4);
    });

  });

  describe('#processLogPrepend', function () {

    beforeEach(function () {
      this.previousEmit = MesosLogStore.emit;
      MesosLogStore.emit = jasmine.createSpy();
      // First item will be used to initialize
      MesosLogStore.processOffset('foo', '/bar', {data: '', offset: 100});
      // Two next processes will be stored
      MesosLogStore.processLogPrepend('foo', '/bar', {data: 'foo', offset: 100});
      MesosLogStore.processLogPrepend('foo', '/bar', {data: 'bar', offset: 103});

      this.logBuffer = MesosLogStore.get('/bar');
    });

    afterEach(function () {
      MesosLogStore.emit = this.previousEmit;
    });

    it('should return all of the log items it was given', function () {
      let items = this.logBuffer.getItems();
      expect(items.length).toEqual(2);
    });

    it('should return the full log of items it was given', function () {
      expect(this.logBuffer.getFullLog()).toEqual('barfoo');
    });

    it('should call the fetch log 2 times', function () {
      jest.runAllTimers();
      expect(RequestUtil.json.calls.count()).toEqual(2);
    });

    it('should call emit with the correct event', function () {
      expect(MesosLogStore.emit).toHaveBeenCalledWith(
        EventTypes.MESOS_LOG_CHANGE, '/bar', 'prepend'
      );
    });

    it('should not call emit with an non-existant path', function () {
      MesosLogStore.emit = jasmine.createSpy();
      MesosLogStore.processLogPrepend('foo', 'wtf', {data: '', offset: 100});
      expect(MesosLogStore.emit).not.toHaveBeenCalled();
    });
  });

  describe('#processLogError', function () {

    beforeEach(function () {
      this.logBuffer = MesosLogStore.get('/bar');
    });

    it('should try to restart the tailing after error', function () {
      MesosLogStore.processLogError('foo', '/bar');
      jest.runAllTimers();
      expect(RequestUtil.json.calls.count()).toEqual(2);
    });

  });

  describe('#processLogPrependError', function () {

    beforeEach(function () {
      this.previousEmit = MesosLogStore.emit;
      MesosLogStore.emit = jasmine.createSpy();
      this.logBuffer = MesosLogStore.get('/bar');
      MesosLogStore.processLogPrependError(
        'foo', '/bar', {data: 'bar', offset: 103}
      );
    });

    afterEach(function () {
      MesosLogStore.emit = this.previousEmit;
    });

    it('should try to restart the tailing after error', function () {
      MesosLogStore.processLogPrependError('foo', '/bar');
      jest.runAllTimers();
      expect(RequestUtil.json.calls.count()).toEqual(3);
    });

    it('should call emit with the correct event', function () {
      expect(MesosLogStore.emit).toHaveBeenCalledWith(
        EventTypes.MESOS_LOG_REQUEST_ERROR, '/bar'
      );
    });

    it('should not call emit with an non-existant path', function () {
      MesosLogStore.emit = jasmine.createSpy();
      MesosLogStore.processLogPrepend('foo', 'wtf', {data: '', offset: 100});
      expect(MesosLogStore.emit).not.toHaveBeenCalled();
    });
  });

  describe('#processOffsetError', function () {

    beforeEach(function () {
      this.logBuffer = MesosLogStore.get('/bar');
    });

    it('should not be initialized after error', function () {
      MesosLogStore.processOffsetError('foo', '/bar');
      expect(this.logBuffer.isInitialized()).toEqual(false);
    });

  });

  describe('#processOffset', function () {

    beforeEach(function () {
      this.logBuffer = MesosLogStore.get('/bar');
    });

    it('should be initialized after initialize and before error', function () {
      // First item will be used to initialize
      MesosLogStore.processOffset('foo', '/bar', {data: '', offset: 100});
      expect(this.logBuffer.isInitialized()).toEqual(true);
    });

  });

  describe('dispatcher', function () {

    it('stores log entry when event is dispatched', function () {
      // Initializing call
      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_MESOS_LOG_OFFSET_SUCCESS,
        data: {data: '', offset: 100},
        path: '/bar',
        slaveID: 'foo'
      });

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_MESOS_LOG_SUCCESS,
        data: {data: 'foo', offset: 100},
        path: '/bar',
        slaveID: 'foo'
      });

      var log = MesosLogStore.get('/bar').getFullLog();
      expect(log).toEqual('foo');
    });

    it('dispatches the correct event upon success', function () {
      var mockedFn = jest.genMockFunction();
      MesosLogStore.addChangeListener(EventTypes.MESOS_LOG_CHANGE, mockedFn);
      // Initializing call
      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_MESOS_LOG_OFFSET_SUCCESS,
        data: {data: '', offset: 100},
        path: '/bar',
        slaveID: 'foo'
      });
      // Actual data processing
      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_MESOS_LOG_SUCCESS,
        data: {data: 'foo', offset: 100},
        path: '/bar',
        slaveID: 'foo'
      });

      expect(mockedFn.mock.calls.length).toEqual(1);
    });

    it('dispatches the correct event upon error', function () {
      var mockedFn = jest.genMockFunction();
      MesosLogStore.addChangeListener(
        EventTypes.MESOS_LOG_REQUEST_ERROR,
        mockedFn
      );
      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_MESOS_LOG_ERROR,
        path: '/bar',
        slaveID: 'foo'
      });

      expect(mockedFn.mock.calls.length).toEqual(1);
    });

  });

});
