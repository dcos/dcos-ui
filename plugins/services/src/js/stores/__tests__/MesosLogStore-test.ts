import AppDispatcher from "#SRC/js/events/AppDispatcher";
import * as SystemLogTypes from "#SRC/js/constants/SystemLogTypes";
import LogBuffer from "../../structs/LogBuffer";
import MesosLogActions from "../../events/MesosLogActions";
import MesosLogStore from "../MesosLogStore";
import * as EventTypes from "../../constants/EventTypes";

const RequestUtil = require("mesosphere-shared-reactjs").RequestUtil;

const ActionTypes = require("../../constants/ActionTypes");

const PREPEND = SystemLogTypes.PREPEND;

let thisRequestFn, thisMockMesosLogStore, thisLogBuffer, thisPreviousEmit;

describe("MesosLogStore", () => {
  beforeEach(() => {
    thisRequestFn = RequestUtil.json;
    RequestUtil.json = jasmine.createSpy();
    MesosLogStore.startTailing("foo", "/bar");
  });

  afterEach(() => {
    MesosLogStore.stopTailing("/bar", true);
    RequestUtil.json = thisRequestFn;
  });

  describe("#startTailing", () => {
    it("returns an instance of LogBuffer", () => {
      const logBuffer = MesosLogStore.getLogBuffer("/bar");
      expect(logBuffer instanceof LogBuffer).toBeTruthy();
    });
  });

  describe("#stopTailing", () => {
    it("does not clear the log buffer by default", () => {
      MesosLogStore.stopTailing("/bar");

      expect(MesosLogStore.getLogBuffer("/bar")).toBeInstanceOf(LogBuffer);
    });

    it("clears the log buffer if configured", () => {
      MesosLogStore.stopTailing("/bar", true);

      expect(MesosLogStore.getLogBuffer("/bar")).toEqual(undefined);
    });
  });

  describe("#getPreviousLogs", () => {
    beforeEach(() => {
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

    it("does nothing if logBuffer doesn't exist", () => {
      MesosLogStore.getPreviousLogs.call(
        thisMockMesosLogStore,
        "slaveID",
        "nonExistentPath"
      );

      expect(MesosLogActions.fetchPreviousLog).not.toHaveBeenCalled();
    });

    it("does nothing if already at the beginning of history", () => {
      MesosLogStore.getPreviousLogs.call(
        thisMockMesosLogStore,
        "slaveID",
        "exists"
      );

      expect(MesosLogActions.fetchPreviousLog).not.toHaveBeenCalled();
    });

    it("adjusts length when reaching the top", () => {
      const MockMesosLogStore = {
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

    it("requests full page when below top", () => {
      const MockMesosLogStore = {
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

  describe("#processLogEntry", () => {
    beforeEach(() => {
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

    it("returns all of the log items it was given", () => {
      const items = thisLogBuffer.getItems();
      jest.runAllTimers();
      expect(items.length).toEqual(2);
    });

    it("returns the full log of items it was given", () => {
      jest.runAllTimers();
      expect(thisLogBuffer.getFullLog()).toEqual("foobar");
    });

    it("calls the fetch log 4 times", () => {
      jest.runAllTimers();
      expect(RequestUtil.json.calls.count()).toEqual(4);
    });
  });

  describe("#processLogPrepend", () => {
    beforeEach(() => {
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

    afterEach(() => {
      MesosLogStore.emit = thisPreviousEmit;
    });

    it("returns all of the log items it was given", () => {
      const items = thisLogBuffer.getItems();
      expect(items.length).toEqual(2);
    });

    it("returns the full log of items it was given", () => {
      expect(thisLogBuffer.getFullLog()).toEqual("barfoo");
    });

    it("calls the fetch log 2 times", () => {
      jest.runAllTimers();
      expect(RequestUtil.json.calls.count()).toEqual(2);
    });

    it("calls emit with the correct event", () => {
      expect(MesosLogStore.emit).toHaveBeenCalledWith(
        EventTypes.MESOS_LOG_CHANGE,
        "/bar",
        PREPEND
      );
    });

    it("does not call emit with an non-existent path", () => {
      MesosLogStore.emit = jasmine.createSpy();
      MesosLogStore.processLogPrepend("foo", "wtf", { data: "", offset: 100 });
      expect(MesosLogStore.emit).not.toHaveBeenCalled();
    });
  });

  describe("#processLogError", () => {
    beforeEach(() => {
      thisLogBuffer = MesosLogStore.getLogBuffer("/bar");
    });

    it("tries to restart the tailing after error", () => {
      MesosLogStore.processLogError("foo", "/bar");
      jest.runAllTimers();
      expect(RequestUtil.json.calls.count()).toEqual(2);
    });
  });

  describe("#processLogPrependError", () => {
    beforeEach(() => {
      thisPreviousEmit = MesosLogStore.emit;
      MesosLogStore.emit = jasmine.createSpy();
      thisLogBuffer = MesosLogStore.getLogBuffer("/bar");
      MesosLogStore.processLogPrependError("foo", "/bar", {
        data: "bar",
        offset: 103
      });
    });

    afterEach(() => {
      MesosLogStore.emit = thisPreviousEmit;
    });

    it("tries to restart the tailing after error", () => {
      MesosLogStore.processLogPrependError("foo", "/bar");
      jest.runAllTimers();
      expect(RequestUtil.json.calls.count()).toEqual(3);
    });

    it("calls emit with the correct event", () => {
      expect(MesosLogStore.emit).toHaveBeenCalledWith(
        EventTypes.MESOS_LOG_REQUEST_ERROR,
        "/bar"
      );
    });

    it("does not call emit with an non-existent path", () => {
      MesosLogStore.emit = jasmine.createSpy();
      MesosLogStore.processLogPrepend("foo", "wtf", { data: "", offset: 100 });
      expect(MesosLogStore.emit).not.toHaveBeenCalled();
    });
  });

  describe("#processOffsetError", () => {
    beforeEach(() => {
      thisLogBuffer = MesosLogStore.getLogBuffer("/bar");
    });

    it("does not be initialized after error", () => {
      MesosLogStore.processOffsetError("foo", "/bar");
      expect(thisLogBuffer.isInitialized()).toEqual(false);
    });
  });

  describe("#processOffset", () => {
    beforeEach(() => {
      thisLogBuffer = MesosLogStore.getLogBuffer("/bar");
    });

    it("is initialized after initialize and before error", () => {
      // First item will be used to initialize
      MesosLogStore.processOffset("foo", "/bar", { data: "", offset: 100 });
      expect(thisLogBuffer.isInitialized()).toEqual(true);
    });
  });

  describe("dispatcher", () => {
    it("stores log entry when event is dispatched", () => {
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

      const log = MesosLogStore.getLogBuffer("/bar").getFullLog();
      expect(log).toEqual("foo");
    });

    it("dispatches the correct event upon success", () => {
      const mockedFn = jest.fn();
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

    it("dispatches the correct event upon error", () => {
      const mockedFn = jest.fn();
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
