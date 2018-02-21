const RequestUtil = require("mesosphere-shared-reactjs").RequestUtil;

const ActionTypes = require("../../constants/ActionTypes");
const AppDispatcher = require("#SRC/js/events/AppDispatcher");
const EventTypes = require("../../constants/EventTypes");
const LogBuffer = require("../../structs/LogBuffer");
const MesosLogActions = require("../../events/MesosLogActions");
const MesosLogStore = require("../MesosLogStore");
const SystemLogTypes = require("#SRC/js/constants/SystemLogTypes");

const PREPEND = SystemLogTypes.PREPEND;

let thisRequestFn, thisMockMesosLogStore, thisLogBuffer, thisPreviousEmit;

describe("MesosLogStore", function() {
  beforeEach(function() {
    thisRequestFn = RequestUtil.json;
    RequestUtil.json = jasmine.createSpy();
    MesosLogStore.startTailing("foo", "/bar");
  });

  afterEach(function() {
    MesosLogStore.stopTailing("/bar", true);
    RequestUtil.json = thisRequestFn;
  });

  describe("#startTailing", function() {
    it("returns an instance of LogBuffer", function() {
      var logBuffer = MesosLogStore.getLogBuffer("/bar");
      expect(logBuffer instanceof LogBuffer).toBeTruthy();
    });
  });

  describe("#stopTailing", function() {
    it("does not clear the log buffer by default", function() {
      MesosLogStore.stopTailing("/bar");

      expect(MesosLogStore.getLogBuffer("/bar")).toBeInstanceOf(LogBuffer);
    });

    it("clears the log buffer if configured", function() {
      MesosLogStore.stopTailing("/bar", true);

      expect(MesosLogStore.getLogBuffer("/bar")).toEqual(undefined);
    });
  });

  describe("#getPreviousLogs", function() {
    beforeEach(function() {
      thisMockMesosLogStore = {
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
        thisMockMesosLogStore,
        "slaveID",
        "nonExistentPath"
      );

      expect(MesosLogActions.fetchPreviousLog).not.toHaveBeenCalled();
    });

    it("does nothing if already at the beginning of history", function() {
      MesosLogStore.getPreviousLogs.call(
        thisMockMesosLogStore,
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
      thisLogBuffer = MesosLogStore.getLogBuffer("/bar");
    });

    it("returns all of the log items it was given", function() {
      const items = thisLogBuffer.getItems();
      jest.runAllTimers();
      expect(items.length).toEqual(2);
    });

    it("returns the full log of items it was given", function() {
      jest.runAllTimers();
      expect(thisLogBuffer.getFullLog()).toEqual("foobar");
    });

    it("calls the fetch log 4 times", function() {
      jest.runAllTimers();
      expect(RequestUtil.json.calls.count()).toEqual(4);
    });
  });

  describe("#processLogPrepend", function() {
    beforeEach(function() {
      thisPreviousEmit = MesosLogStore.emit;
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

      thisLogBuffer = MesosLogStore.getLogBuffer("/bar");
    });

    afterEach(function() {
      MesosLogStore.emit = thisPreviousEmit;
    });

    it("returns all of the log items it was given", function() {
      const items = thisLogBuffer.getItems();
      expect(items.length).toEqual(2);
    });

    it("returns the full log of items it was given", function() {
      expect(thisLogBuffer.getFullLog()).toEqual("barfoo");
    });

    it("calls the fetch log 2 times", function() {
      jest.runAllTimers();
      expect(RequestUtil.json.calls.count()).toEqual(2);
    });

    it("calls emit with the correct event", function() {
      expect(MesosLogStore.emit).toHaveBeenCalledWith(
        EventTypes.MESOS_LOG_CHANGE,
        "/bar",
        PREPEND
      );
    });

    it("does not call emit with an non-existent path", function() {
      MesosLogStore.emit = jasmine.createSpy();
      MesosLogStore.processLogPrepend("foo", "wtf", { data: "", offset: 100 });
      expect(MesosLogStore.emit).not.toHaveBeenCalled();
    });
  });

  describe("#processLogError", function() {
    beforeEach(function() {
      thisLogBuffer = MesosLogStore.getLogBuffer("/bar");
    });

    it("tries to restart the tailing after error", function() {
      MesosLogStore.processLogError("foo", "/bar");
      jest.runAllTimers();
      expect(RequestUtil.json.calls.count()).toEqual(2);
    });
  });

  describe("#processLogPrependError", function() {
    beforeEach(function() {
      thisPreviousEmit = MesosLogStore.emit;
      MesosLogStore.emit = jasmine.createSpy();
      thisLogBuffer = MesosLogStore.getLogBuffer("/bar");
      MesosLogStore.processLogPrependError("foo", "/bar", {
        data: "bar",
        offset: 103
      });
    });

    afterEach(function() {
      MesosLogStore.emit = thisPreviousEmit;
    });

    it("tries to restart the tailing after error", function() {
      MesosLogStore.processLogPrependError("foo", "/bar");
      jest.runAllTimers();
      expect(RequestUtil.json.calls.count()).toEqual(3);
    });

    it("calls emit with the correct event", function() {
      expect(MesosLogStore.emit).toHaveBeenCalledWith(
        EventTypes.MESOS_LOG_REQUEST_ERROR,
        "/bar"
      );
    });

    it("does not call emit with an non-existent path", function() {
      MesosLogStore.emit = jasmine.createSpy();
      MesosLogStore.processLogPrepend("foo", "wtf", { data: "", offset: 100 });
      expect(MesosLogStore.emit).not.toHaveBeenCalled();
    });
  });

  describe("#processOffsetError", function() {
    beforeEach(function() {
      thisLogBuffer = MesosLogStore.getLogBuffer("/bar");
    });

    it("does not be initialized after error", function() {
      MesosLogStore.processOffsetError("foo", "/bar");
      expect(thisLogBuffer.isInitialized()).toEqual(false);
    });
  });

  describe("#processOffset", function() {
    beforeEach(function() {
      thisLogBuffer = MesosLogStore.getLogBuffer("/bar");
    });

    it("is initialized after initialize and before error", function() {
      // First item will be used to initialize
      MesosLogStore.processOffset("foo", "/bar", { data: "", offset: 100 });
      expect(thisLogBuffer.isInitialized()).toEqual(true);
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
