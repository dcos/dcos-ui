jest.dontMock("../MesosLogStore");
jest.dontMock("../../../../../../src/js/config/Config");
jest.dontMock("../../events/MesosLogActions");
jest.dontMock("../../structs/LogBuffer");
jest.dontMock("../../../../../../src/js/structs/Item");
jest.dontMock("../../../../../../src/js/structs/List");
jest.dontMock("../../../../../../src/js/utils/Util");

const RequestUtil = require("mesosphere-shared-reactjs").RequestUtil;

const ActionTypes = require("../../constants/ActionTypes");
const AppDispatcher = require("../../../../../../src/js/events/AppDispatcher");
const EventTypes = require("../../constants/EventTypes");
const LogBuffer = require("../../structs/LogBuffer");
const MesosLogActions = require("../../events/MesosLogActions");
const MesosLogStore = require("../MesosLogStore");
const SystemLogTypes = require("../../../../../../src/js/constants/SystemLogTypes");

const PREPEND = SystemLogTypes.PREPEND;

describe("MesosLogStore", function() {
  beforeEach(function() {
    this.requestFn = RequestUtil.json;
    RequestUtil.json = jasmine.createSpy();
    MesosLogStore.startTailing("foo", "/bar");
  });

  afterEach(function() {
    MesosLogStore.stopTailing("/bar", true);
    RequestUtil.json = this.requestFn;
  });

  describe("#startTailing", function() {
    it("should return an instance of LogBuffer", function() {
      var logBuffer = MesosLogStore.getLogBuffer("/bar");
      expect(logBuffer instanceof LogBuffer).toBeTruthy();
    });
  });

  describe("#stopTailing", function() {
    it("should not clear the log buffer by default", function() {
      MesosLogStore.stopTailing("/bar");

      expect(MesosLogStore.getLogBuffer("/bar")).toBeInstanceOf(LogBuffer);
    });

    it("should clear the log buffer if configured", function() {
      MesosLogStore.stopTailing("/bar", true);

      expect(MesosLogStore.getLogBuffer("/bar")).toEqual(undefined);
    });
  });

  describe("#getPreviousLogs", function() {
    beforeEach(function() {
      this.MockMesosLogStore = {
        getLogBuffer(key) {
          if (key === "exists") {
            return {
              hasLoadedTop() {
                return true;
              },
              getStart() {
                return 0;
              }
            };
          }
        }
      };

      MesosLogActions.fetchPreviousLog = jasmine.createSpy();
    });

    it("does nothing if logBuffer doesn't exist", function() {
      MesosLogStore.getPreviousLogs.call(
        this.MockMesosLogStore,
        "slaveID",
        "nonExistentPath"
      );

      expect(MesosLogActions.fetchPreviousLog).not.toHaveBeenCalled();
    });

    it("does nothing if already at the beginning of history", function() {
      MesosLogStore.getPreviousLogs.call(
        this.MockMesosLogStore,
        "slaveID",
        "exists"
      );

      expect(MesosLogActions.fetchPreviousLog).not.toHaveBeenCalled();
    });

    it("adjusts length when reaching the top", function() {
      var MockMesosLogStore = {
        getLogBuffer(key) {
          if (key === "exists") {
            return {
              hasLoadedTop() {
                return false;
              },
              getStart() {
                return 100;
              }
            };
          }
        }
      };

      MesosLogStore.getPreviousLogs.call(
        MockMesosLogStore,
        "slaveID",
        "exists"
      );

      expect(MesosLogActions.fetchPreviousLog).toHaveBeenCalledWith(
        "slaveID",
        "exists",
        0,
        100
      );
    });

    it("requests full page when below top", function() {
      var MockMesosLogStore = {
        getLogBuffer(key) {
          if (key === "exists") {
            return {
              hasLoadedTop() {
                return false;
              },
              getStart() {
                return 50100;
              }
            };
          }
        }
      };

      MesosLogStore.getPreviousLogs.call(
        MockMesosLogStore,
        "slaveID",
        "exists"
      );

      expect(MesosLogActions.fetchPreviousLog).toHaveBeenCalledWith(
        "slaveID",
        "exists",
        100,
        50000
      );
    });
  });

  describe("#processLogEntry", function() {
    beforeEach(function() {
      // First item will be used to initialize
      MesosLogStore.processOffset("foo", "/bar", { data: "", offset: 100 });
      // Two next processes will be stored
      MesosLogStore.processLogEntry("foo", "/bar", {
        data: "foo",
        offset: 100
      });
      MesosLogStore.processLogEntry("foo", "/bar", {
        data: "bar",
        offset: 103
      });
      this.logBuffer = MesosLogStore.getLogBuffer("/bar");
    });

    it("should return all of the log items it was given", function() {
      const items = this.logBuffer.getItems();
      jest.runAllTimers();
      expect(items.length).toEqual(2);
    });

    it("should return the full log of items it was given", function() {
      jest.runAllTimers();
      expect(this.logBuffer.getFullLog()).toEqual("foobar");
    });

    it("should call the fetch log 4 times", function() {
      jest.runAllTimers();
      expect(RequestUtil.json.calls.count()).toEqual(4);
    });
  });

  describe("#processLogPrepend", function() {
    beforeEach(function() {
      this.previousEmit = MesosLogStore.emit;
      MesosLogStore.emit = jasmine.createSpy();
      // First item will be used to initialize
      MesosLogStore.processOffset("foo", "/bar", { data: "", offset: 100 });
      // Two next processes will be stored
      MesosLogStore.processLogPrepend("foo", "/bar", {
        data: "foo",
        offset: 100
      });
      MesosLogStore.processLogPrepend("foo", "/bar", {
        data: "bar",
        offset: 103
      });

      this.logBuffer = MesosLogStore.getLogBuffer("/bar");
    });

    afterEach(function() {
      MesosLogStore.emit = this.previousEmit;
    });

    it("should return all of the log items it was given", function() {
      const items = this.logBuffer.getItems();
      expect(items.length).toEqual(2);
    });

    it("should return the full log of items it was given", function() {
      expect(this.logBuffer.getFullLog()).toEqual("barfoo");
    });

    it("should call the fetch log 2 times", function() {
      jest.runAllTimers();
      expect(RequestUtil.json.calls.count()).toEqual(2);
    });

    it("should call emit with the correct event", function() {
      expect(MesosLogStore.emit).toHaveBeenCalledWith(
        EventTypes.MESOS_LOG_CHANGE,
        "/bar",
        PREPEND
      );
    });

    it("should not call emit with an non-existent path", function() {
      MesosLogStore.emit = jasmine.createSpy();
      MesosLogStore.processLogPrepend("foo", "wtf", { data: "", offset: 100 });
      expect(MesosLogStore.emit).not.toHaveBeenCalled();
    });
  });

  describe("#processLogError", function() {
    beforeEach(function() {
      this.logBuffer = MesosLogStore.getLogBuffer("/bar");
    });

    it("should try to restart the tailing after error", function() {
      MesosLogStore.processLogError("foo", "/bar");
      jest.runAllTimers();
      expect(RequestUtil.json.calls.count()).toEqual(2);
    });
  });

  describe("#processLogPrependError", function() {
    beforeEach(function() {
      this.previousEmit = MesosLogStore.emit;
      MesosLogStore.emit = jasmine.createSpy();
      this.logBuffer = MesosLogStore.getLogBuffer("/bar");
      MesosLogStore.processLogPrependError("foo", "/bar", {
        data: "bar",
        offset: 103
      });
    });

    afterEach(function() {
      MesosLogStore.emit = this.previousEmit;
    });

    it("should try to restart the tailing after error", function() {
      MesosLogStore.processLogPrependError("foo", "/bar");
      jest.runAllTimers();
      expect(RequestUtil.json.calls.count()).toEqual(3);
    });

    it("should call emit with the correct event", function() {
      expect(MesosLogStore.emit).toHaveBeenCalledWith(
        EventTypes.MESOS_LOG_REQUEST_ERROR,
        "/bar"
      );
    });

    it("should not call emit with an non-existent path", function() {
      MesosLogStore.emit = jasmine.createSpy();
      MesosLogStore.processLogPrepend("foo", "wtf", { data: "", offset: 100 });
      expect(MesosLogStore.emit).not.toHaveBeenCalled();
    });
  });

  describe("#processOffsetError", function() {
    beforeEach(function() {
      this.logBuffer = MesosLogStore.getLogBuffer("/bar");
    });

    it("should not be initialized after error", function() {
      MesosLogStore.processOffsetError("foo", "/bar");
      expect(this.logBuffer.isInitialized()).toEqual(false);
    });
  });

  describe("#processOffset", function() {
    beforeEach(function() {
      this.logBuffer = MesosLogStore.getLogBuffer("/bar");
    });

    it("should be initialized after initialize and before error", function() {
      // First item will be used to initialize
      MesosLogStore.processOffset("foo", "/bar", { data: "", offset: 100 });
      expect(this.logBuffer.isInitialized()).toEqual(true);
    });
  });

  describe("dispatcher", function() {
    it("stores log entry when event is dispatched", function() {
      // Initializing call
      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_MESOS_LOG_OFFSET_SUCCESS,
        data: { data: "", offset: 100 },
        path: "/bar",
        slaveID: "foo"
      });

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_MESOS_LOG_SUCCESS,
        data: { data: "foo", offset: 100 },
        path: "/bar",
        slaveID: "foo"
      });

      var log = MesosLogStore.getLogBuffer("/bar").getFullLog();
      expect(log).toEqual("foo");
    });

    it("dispatches the correct event upon success", function() {
      var mockedFn = jest.genMockFunction();
      MesosLogStore.addChangeListener(EventTypes.MESOS_LOG_CHANGE, mockedFn);
      // Initializing call
      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_MESOS_LOG_OFFSET_SUCCESS,
        data: { data: "", offset: 100 },
        path: "/bar",
        slaveID: "foo"
      });
      // Actual data processing
      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_MESOS_LOG_SUCCESS,
        data: { data: "foo", offset: 100 },
        path: "/bar",
        slaveID: "foo"
      });

      expect(mockedFn.mock.calls.length).toEqual(1);
    });

    it("dispatches the correct event upon error", function() {
      var mockedFn = jest.genMockFunction();
      MesosLogStore.addChangeListener(
        EventTypes.MESOS_LOG_REQUEST_ERROR,
        mockedFn
      );
      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_MESOS_LOG_ERROR,
        path: "/bar",
        slaveID: "foo"
      });

      expect(mockedFn.mock.calls.length).toEqual(1);
    });
  });
});
