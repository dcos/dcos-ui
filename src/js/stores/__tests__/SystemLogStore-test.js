jest.dontMock("../../constants/ActionTypes");
jest.dontMock("../../constants/EventTypes");
jest.dontMock("../../events/AppDispatcher");
jest.dontMock("../SystemLogStore");
jest.dontMock("../../constants/EventTypes");
jest.dontMock("../../constants/SystemLogTypes");

const ActionTypes = require("../../constants/ActionTypes");
const AppDispatcher = require("../../events/AppDispatcher");
const EventTypes = require("../../constants/EventTypes");
const SystemLogTypes = require("../../constants/SystemLogTypes");
const SystemLogStore = require("../SystemLogStore");

function resetLogData(subscriptionID, newLogData) {
  const originalAddEntries = SystemLogStore.addEntries;
  // Overload addEntries to clear out log data for 'subscriptionID'
  SystemLogStore.addEntries = jasmine
    .createSpy("#addEntries")
    .and.returnValue(newLogData);
  SystemLogStore.processLogAppend(subscriptionID);
  // Reset addEntries to it's original functionality
  SystemLogStore.addEntries = originalAddEntries;
}

describe("SystemLogStore", function() {
  afterEach(function() {
    resetLogData("subscriptionID", null);
  });

  describe("#addEntries", function() {
    it("appends data to existing data", function() {
      const entries = [
        { fields: { MESSAGE: "foo" } },
        { fields: { MESSAGE: "bar" } },
        { fields: { MESSAGE: "baz" } }
      ];
      const logData = {
        entries: [
          { fields: { MESSAGE: "one" } },
          { fields: { MESSAGE: "two" } }
        ],
        totalSize: 6
      };
      const result = SystemLogStore.addEntries(
        logData,
        entries,
        SystemLogTypes.APPEND
      );

      expect(
        result.entries.map(entry => {
          return entry.fields.MESSAGE;
        })
      ).toEqual(["one", "two", "foo", "bar", "baz"]);
      expect(result.totalSize).toEqual(15);
    });

    it("doesn't remove when there is no length added", function() {
      const entires = [
        { fields: { MESSAGE: "" } },
        { fields: { MESSAGE: "" } },
        { fields: { MESSAGE: "" } }
      ];
      const logData = {
        entries: [
          { fields: { MESSAGE: "one" } },
          { fields: { MESSAGE: "two" } }
        ],
        // Allow room for one more entry, but not the two following
        totalSize: 500000
      };
      const result = SystemLogStore.addEntries(
        logData,
        entires,
        SystemLogTypes.APPEND
      );

      const entries = result.entries.map(entry => {
        return entry.fields.MESSAGE;
      });

      expect(entries).toEqual(["one", "two", "", "", ""]);
      expect(result.totalSize).toEqual(500000);
    });

    it("prepends data to existing data", function() {
      const entires = [
        { fields: { MESSAGE: "foo" } },
        { fields: { MESSAGE: "bar" } },
        { fields: { MESSAGE: "baz" } }
      ];
      const logData = {
        entries: [
          { fields: { MESSAGE: "one" } },
          { fields: { MESSAGE: "two" } }
        ],
        totalSize: 6
      };
      const result = SystemLogStore.addEntries(
        logData,
        entires,
        SystemLogTypes.PREPEND
      );

      const entries = result.entries.map(entry => {
        return entry.fields.MESSAGE;
      });

      expect(entries).toEqual(["foo", "bar", "baz", "one", "two"]);
      expect(result.totalSize).toEqual(15);
    });

    it("doesn't remove when there is no length added", function() {
      const entries = [
        { fields: { MESSAGE: "" } },
        { fields: { MESSAGE: "" } },
        { fields: { MESSAGE: "" } }
      ];
      const logData = {
        entries: [
          { fields: { MESSAGE: "one" } },
          { fields: { MESSAGE: "two" } }
        ],
        // Allow room for one more entry, but not the two following
        totalSize: 500000
      };
      const result = SystemLogStore.addEntries(
        logData,
        entries,
        SystemLogTypes.PREPEND
      );

      expect(
        result.entries.map(entry => {
          return entry.fields.MESSAGE;
        })
      ).toEqual(["", "", "", "one", "two"]);
      expect(result.totalSize).toEqual(500000);
    });
  });

  describe("#processLogAppend", function() {
    it("appends data to existing data", function() {
      resetLogData("subscriptionID", {
        entries: [
          { fields: { MESSAGE: "one" } },
          { fields: { MESSAGE: "two" } }
        ],
        totalSize: 6
      });
      SystemLogStore.processLogAppend("subscriptionID", [
        { fields: { MESSAGE: "foo" } }
      ]);
      SystemLogStore.processLogAppend("subscriptionID", [
        { fields: { MESSAGE: "bar" } }
      ]);
      SystemLogStore.processLogAppend("subscriptionID", [
        { fields: { MESSAGE: "baz" } }
      ]);

      expect(SystemLogStore.getFullLog("subscriptionID")).toEqual(
        "one\ntwo\nfoo\nbar\nbaz"
      );
    });

    it("doesn't add empty MESSAGEs", function() {
      resetLogData("subscriptionID", {
        entries: [
          { fields: { MESSAGE: "one" } },
          { fields: { MESSAGE: "two" } }
        ],
        // Allow room for one more entry, but not the two following
        totalSize: 500000
      });

      SystemLogStore.processLogAppend("subscriptionID", [
        { fields: { MESSAGE: "" } }
      ]);
      SystemLogStore.processLogAppend("subscriptionID", [
        { fields: { MESSAGE: "" } }
      ]);
      SystemLogStore.processLogAppend("subscriptionID", [
        { fields: { MESSAGE: "" } }
      ]);

      expect(SystemLogStore.getFullLog("subscriptionID")).toEqual("one\ntwo");
    });
  });

  describe("#processLogPrepend", function() {
    it("prepends data to existing data", function() {
      resetLogData("subscriptionID", {
        entries: [
          { fields: { MESSAGE: "one" } },
          { fields: { MESSAGE: "two" } }
        ],
        totalSize: 6
      });

      SystemLogStore.processLogPrepend("subscriptionID", false, [
        { fields: { MESSAGE: "foo" } },
        { fields: { MESSAGE: "bar" } },
        { fields: { MESSAGE: "baz" } }
      ]);

      expect(SystemLogStore.getFullLog("subscriptionID")).toEqual(
        "foo\nbar\nbaz\none\ntwo"
      );
    });

    it("doesn't remove when there is no length added", function() {
      resetLogData("subscriptionID", {
        entries: [
          { fields: { MESSAGE: "one" } },
          { fields: { MESSAGE: "two" } }
        ],
        // Allow room for one more entry, but not the two following
        totalSize: 500000
      });

      SystemLogStore.processLogPrepend("subscriptionID", false, [
        { fields: { MESSAGE: "" } },
        { fields: { MESSAGE: "" } },
        { fields: { MESSAGE: "" } }
      ]);

      expect(SystemLogStore.getFullLog("subscriptionID")).toEqual("one\ntwo");
    });
  });

  describe("#getFullLog", function() {
    it("returns full log", function() {
      SystemLogStore.processLogAppend("subscriptionID", [
        { fields: { MESSAGE: "foo" } }
      ]);
      SystemLogStore.processLogAppend("subscriptionID", [
        { fields: { MESSAGE: "bar" } }
      ]);
      SystemLogStore.processLogAppend("subscriptionID", [
        { fields: { MESSAGE: "baz" } }
      ]);

      const result = SystemLogStore.getFullLog("subscriptionID");

      expect(result).toEqual("foo\nbar\nbaz");
    });

    it("returns correct format", function() {
      SystemLogStore.processLogAppend("subscriptionID", [
        { fields: { MESSAGE: "foo" }, realtime_timestamp: 10000000 }
      ]);
      SystemLogStore.processLogAppend("subscriptionID", [
        { fields: { MESSAGE: "bar" } }
      ]);

      const result = SystemLogStore.getFullLog("subscriptionID");

      expect(result).toEqual("1970-01-01 12:00:10: foo\nbar");
    });

    it("returns empty string for a log that doesn't exist", function() {
      const result = SystemLogStore.getFullLog("subscriptionID");

      expect(result).toEqual("");
    });
  });

  describe("storeID", function() {
    it("should return 'systemLog'", function() {
      expect(SystemLogStore.storeID).toEqual("systemLog");
    });
  });

  describe("dispatcher", function() {
    it("emits event after #processLogAppend event is dispatched", function() {
      const changeHandler = jasmine.createSpy("changeHandler");
      SystemLogStore.addChangeListener(
        EventTypes.SYSTEM_LOG_CHANGE,
        changeHandler
      );

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_SYSTEM_LOG_SUCCESS,
        data: [{ fields: { MESSAGE: "foo" } }],
        subscriptionID: "subscriptionID"
      });

      expect(changeHandler).toHaveBeenCalledWith(
        "subscriptionID",
        SystemLogTypes.APPEND
      );
    });

    it("emits event after #processLogError event is dispatched", function() {
      const changeHandler = jasmine.createSpy("changeHandler");
      SystemLogStore.addChangeListener(
        EventTypes.SYSTEM_LOG_REQUEST_ERROR,
        changeHandler
      );

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_SYSTEM_LOG_ERROR,
        data: { error: "foo" },
        subscriptionID: "subscriptionID"
      });

      expect(
        changeHandler
      ).toHaveBeenCalledWith("subscriptionID", SystemLogTypes.APPEND, {
        error: "foo"
      });
    });

    it("emits event after #processLogPrepend event is dispatched", function() {
      const changeHandler = jasmine.createSpy("changeHandler");
      SystemLogStore.addChangeListener(
        EventTypes.SYSTEM_LOG_CHANGE,
        changeHandler
      );

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_PREVIOUS_SYSTEM_LOG_SUCCESS,
        data: [{ fields: { MESSAGE: "foo" } }],
        firstEntry: false,
        subscriptionID: "subscriptionID"
      });

      expect(changeHandler).toHaveBeenCalledWith(
        "subscriptionID",
        SystemLogTypes.PREPEND
      );
    });

    it("emits event after #processLogPrependError event is dispatched", function() {
      const changeHandler = jasmine.createSpy("changeHandler");
      SystemLogStore.addChangeListener(
        EventTypes.SYSTEM_LOG_REQUEST_ERROR,
        changeHandler
      );

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_SYSTEM_LOG_ERROR,
        data: { error: "foo" },
        subscriptionID: "subscriptionID"
      });

      expect(
        changeHandler
      ).toHaveBeenCalledWith("subscriptionID", SystemLogTypes.APPEND, {
        error: "foo"
      });
    });
  });
});
