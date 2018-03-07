const JestUtil = require("#SRC/js/utils/JestUtil");

JestUtil.unMockStores([
  "MarathonStore",
  "MesosStateStore",
  "MesosSummaryStore"
]);

/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");
const TestUtils = require("react-addons-test-utils");

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
  thisContainer,
  thisParams,
  thisInstance,
  thisGetNodeFromID;

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

    thisContainer = global.document.createElement("div");
    thisParams = { id: "foo", taskID: "bar" };
    thisInstance = JestUtil.renderWithStubbedRouter(
      TaskDetail,
      {
        params: thisParams,
        routes: [{ path: "/services/detail/:id/tasks/:taskID" }]
      },
      thisContainer,
      {}
    );
    thisInstance.setState = jasmine.createSpy("setState");
    thisInstance.getErrorScreen = jasmine.createSpy("getErrorScreen");
  });

  afterEach(function() {
    // Restore original functions
    MesosStateStore.get = thisStoreGet;
    MesosStateStore.addChangeListener = thisStoreChangeListener;
    TaskDirectoryStore.fetchDirectory = thisStoreGetDirectory;
    TaskDirectoryStore.setPath = thisStoreSetPath;

    ReactDOM.unmountComponentAtNode(thisContainer);
  });

  describe("#componentDidMount", function() {
    it("calls fetchDirectory after onStateStoreSuccess is called", function() {
      thisInstance.onStateStoreSuccess();
      expect(TaskDirectoryStore.fetchDirectory).toHaveBeenCalled();
    });
  });

  describe("#onTaskDirectoryStoreError", function() {
    it("increments taskDirectoryErrorCount state", function() {
      thisInstance.state = { taskDirectoryErrorCount: 1 };
      thisInstance.onTaskDirectoryStoreError();
      expect(thisInstance.setState).toHaveBeenCalledWith({
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

      thisInstance.onTaskDirectoryStoreSuccess("bar");
      expect(thisInstance.setState).toHaveBeenCalledWith({
        directory,
        taskDirectoryErrorCount: 0
      });
    });
  });

  describe("#handleFetchDirectory", function() {
    it("calls TaskDirectoryStore.fetchDirectory", function() {
      thisInstance.handleFetchDirectory();
      expect(TaskDirectoryStore.fetchDirectory).toHaveBeenCalled();
    });

    it("does not call TaskDirectoryStore.fetchDirectory", function() {
      MesosStateStore.getTaskFromTaskID = function() {
        return null;
      };
      thisInstance.handleFetchDirectory();
      expect(TaskDirectoryStore.fetchDirectory).not.toHaveBeenCalled();
    });
  });

  describe("#handleBreadcrumbClick", function() {
    it("calls TaskDirectoryStore.setPath", function() {
      thisInstance.handleBreadcrumbClick();
      expect(TaskDirectoryStore.setPath).toHaveBeenCalled();
    });

    it("does not call TaskDirectoryStore.setPath", function() {
      MesosStateStore.getTaskFromTaskID = function() {
        return null;
      };
      thisInstance.handleBreadcrumbClick();
      expect(TaskDirectoryStore.setPath).not.toHaveBeenCalled();
    });
  });

  describe("#getSubView", function() {
    beforeEach(function() {
      thisGetNodeFromID = MesosStateStore.getNodeFromID;
      MesosStateStore.getNodeFromID = function() {
        return { hostname: "hello" };
      };
      thisContainer = global.document.createElement("div");
    });

    afterEach(function() {
      MesosStateStore.getNodeFromID = thisGetNodeFromID;

      ReactDOM.unmountComponentAtNode(thisContainer);
    });

    it("calls getErrorScreen when error occurred", function() {
      thisInstance.state = {
        directory: new TaskDirectory({
          items: [{ nlink: 1, path: "/stdout" }]
        }),
        taskDirectoryErrorCount: 3
      };
      thisInstance.getSubView();

      expect(thisInstance.getErrorScreen).toHaveBeenCalled();
    });

    it("ignores getErrorScreen when error has not occurred", function() {
      // Let innerPath return something
      TaskDirectoryStore.get = jasmine
        .createSpy("TaskDirectoryStore#get")
        .and.returnValue("");
      thisInstance.state = {
        directory: new TaskDirectory({ items: [{ nlink: 1, path: "/stdout" }] })
      };
      thisInstance.getSubView();

      expect(thisInstance.getErrorScreen).not.toHaveBeenCalled();
    });

    it("returns null if there are no nodes", function() {
      const node = ReactDOM.findDOMNode(thisInstance);
      expect(node).toEqual(null);
    });

    it("returns an element if there is a node", function() {
      MesosStateStore.get = function() {
        return new Task({
          slaves: { fakeProp: "faked" }
        });
      };

      const instance = JestUtil.renderWithStubbedRouter(
        TaskDetail,
        {
          params: thisParams,
          routes: [{ path: "/services/detail/:id/tasks/:taskID" }]
        },
        thisContainer,
        {}
      );

      const node = ReactDOM.findDOMNode(instance);
      expect(TestUtils.isDOMComponent(node)).toEqual(true);
    });
  });

  describe("#getBasicInfo", function() {
    it("returns null if task is null", function() {
      MesosStateStore.getTaskFromTaskID = function() {
        return null;
      };
      const result = thisInstance.getBasicInfo();
      expect(result).toEqual(null);
    });

    it("returns an element if task is not null", function() {
      const result = thisInstance.getBasicInfo();

      expect(TestUtils.isElement(result)).toEqual(true);
    });
  });
});
