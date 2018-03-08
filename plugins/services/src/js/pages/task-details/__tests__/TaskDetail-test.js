const JestUtil = require("#SRC/js/utils/JestUtil");

JestUtil.unMockStores([
  "MarathonStore",
  "MesosStateStore",
  "MesosSummaryStore"
]);

jest.mock("#SRC/js/utils/RouterUtil", function() {
  return {
    reconstructPathFromRoutes: jest.fn()
  };
});

jest.mock("react-router", function() {
  return {
    formatPattern: jest.fn()
  };
});

/* eslint-disable no-unused-vars */
const MesosSummaryStore = require("#SRC/js/stores/MesosSummaryStore");
/* eslint-enable no-unused-vars */
const MesosStateStore = require("#SRC/js/stores/MesosStateStore");
const Task = require("../../../structs/Task");
const TaskDirectory = require("../../../structs/TaskDirectory");
const TaskDirectoryStore = require("../../../stores/TaskDirectoryStore");
const TaskDetail = require("../TaskDetail");

let thisStoreGetDirectory,
  thisStoreSetPath,
  thisStoreGet,
  thisStoreChangeListener,
  thisParams;

let mockThis;

describe("TaskDetail", function() {
  beforeEach(function() {
    // Store original versions
    thisStoreGetDirectory = TaskDirectoryStore.fetchDirectory;
    thisStoreSetPath = TaskDirectoryStore.setPath;
    thisStoreGet = MesosStateStore.get;
    thisStoreChangeListener = MesosStateStore.addChangeListener;

    // Create mock functions
    MesosStateStore.get = function(key) {
      if (key === "lastMesosState") {
        return {};
      }
    };
    MesosStateStore.addChangeListener = function() {};
    MesosStateStore.getTaskFromTaskID = function() {
      return new Task({
        id: "bar",
        state: "TASK_RUNNING"
      });
    };

    TaskDirectoryStore.fetchDirectory = jasmine.createSpy("fetchDirectory");
    TaskDirectoryStore.setPath = jasmine.createSpy("setPath");

    thisParams = { id: "foo", taskID: "bar" };

    mockThis = {
      context: { router: { push: jest.fn() } },
      getLoadingScreen: jest.fn(),
      hasLoadingError: jest.fn(),
      hasVolumes: jest.fn(),
      props: { params: { taskID: "task-42" } },
      state: {},
      tabs_getRoutedTabs: jest.fn(),
      setState: jest.fn(),
      handleFetchDirectory: jest.fn()
    };
  });

  afterEach(function() {
    // Restore original functions
    MesosStateStore.get = thisStoreGet;
    MesosStateStore.addChangeListener = thisStoreChangeListener;
    TaskDirectoryStore.fetchDirectory = thisStoreGetDirectory;
    TaskDirectoryStore.setPath = thisStoreSetPath;
  });

  describe("#componentDidMount", function() {
    it("calls fetchDirectory after onStateStoreSuccess is called", function() {
      TaskDetail.prototype.onStateStoreSuccess.call(mockThis);
      expect(mockThis.handleFetchDirectory).toHaveBeenCalled();
    });
  });

  describe("#onTaskDirectoryStoreError", function() {
    it("increments taskDirectoryErrorCount state", function() {
      mockThis.state = { taskDirectoryErrorCount: 1 };
      TaskDetail.prototype.onTaskDirectoryStoreError.call(mockThis);
      expect(mockThis.setState).toHaveBeenCalledWith({
        taskDirectoryErrorCount: 2
      });
    });
  });

  describe("#onTaskDirectoryStoreSuccess", function() {
    it("increments onTaskDirectoryStoreSuccess state", function() {
      const directory = new TaskDirectory({
        items: [{ nlink: 1, path: "/stdout" }]
      });
      // Let directory return something
      TaskDirectoryStore.get = jasmine
        .createSpy("TaskDirectoryStore#get")
        .and.returnValue(directory);

      TaskDetail.prototype.onTaskDirectoryStoreSuccess.call(
        mockThis,
        "task-42"
      );
      expect(mockThis.setState).toHaveBeenCalledWith({
        directory,
        taskDirectoryErrorCount: 0
      });
    });
  });

  describe("#handleFetchDirectory", function() {
    it("calls TaskDirectoryStore.fetchDirectory", function() {
      delete mockThis.handleFetchDirectory;
      TaskDetail.prototype.handleFetchDirectory.call(mockThis);
      expect(TaskDirectoryStore.fetchDirectory).toHaveBeenCalled();
    });

    it("does not call TaskDirectoryStore.fetchDirectory", function() {
      MesosStateStore.getTaskFromTaskID = function() {
        return null;
      };
      TaskDetail.prototype.handleFetchDirectory.call(mockThis);
      expect(TaskDirectoryStore.fetchDirectory).not.toHaveBeenCalled();
    });
  });

  describe("#handleBreadcrumbClick", function() {
    it("calls TaskDirectoryStore.setPath", function() {
      TaskDetail.prototype.handleBreadcrumbClick.call(mockThis);
      expect(TaskDirectoryStore.setPath).toHaveBeenCalled();
    });

    it("does not call TaskDirectoryStore.setPath", function() {
      MesosStateStore.getTaskFromTaskID = function() {
        return null;
      };
      TaskDetail.prototype.handleBreadcrumbClick.call(mockThis);
      expect(TaskDirectoryStore.setPath).not.toHaveBeenCalled();
    });
  });

  describe("#getSubView", function() {
    it("calls getErrorScreen when error occurred", function() {
      const mockGetErrorScreen = jest.fn();
      TaskDetail.prototype.getSubView.call({
        ...mockThis,
        getErrorScreen: mockGetErrorScreen,
        hasLoadingError: jest.fn(function() {
          return true;
        })
      });

      expect(mockGetErrorScreen).toHaveBeenCalled();
    });

    it("ignores getErrorScreen when error has not occurred", function() {
      const mockGetErrorScreen = jest.fn();
      TaskDetail.prototype.getSubView.call({
        ...mockThis,
        getErrorScreen: mockGetErrorScreen,
        hasLoadingError: jest.fn(function() {
          return false;
        })
      });

      expect(mockGetErrorScreen).not.toHaveBeenCalled();
    });

    it("returns loading indicator if there are no nodes", function() {
      expect(
        TaskDetail.prototype.getSubView.call({
          ...mockThis,
          getLoadingScreen: jest.fn(function() {
            return "loading";
          })
        })
      ).toEqual("loading");
    });

    it("returns an element if there is a node", function() {
      expect(
        TaskDetail.prototype.getSubView.call({
          ...mockThis,
          props: {
            params: thisParams,
            routes: [{ path: "/services/detail/:id/tasks/:taskID" }]
          }
        })
      ).not.toEqual(null);
    });
  });

  describe("#getBasicInfo", function() {
    it("returns null if task is null", function() {
      MesosStateStore.getTaskFromTaskID = function() {
        return null;
      };

      expect(TaskDetail.prototype.getBasicInfo.call(mockThis)).toEqual(null);
    });

    it("returns an element if task is not null", function() {
      expect(TaskDetail.prototype.getBasicInfo.call(mockThis)).not.toEqual(
        null
      );
    });
  });
});
