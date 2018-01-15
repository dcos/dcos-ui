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

describe("TaskDetail", function() {
  beforeEach(function() {
    // Store original versions
    this.storeGetDirectory = TaskDirectoryStore.fetchDirectory;
    this.storeSetPath = TaskDirectoryStore.setPath;
    this.storeGet = MesosStateStore.get;
    this.storeChangeListener = MesosStateStore.addChangeListener;

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

    this.container = global.document.createElement("div");
    this.params = { id: "foo", taskID: "bar" };
    this.instance = JestUtil.renderWithStubbedRouter(
      TaskDetail,
      {
        params: this.params,
        routes: [{ path: "/services/detail/:id/tasks/:taskID" }]
      },
      this.container,
      {}
    );
    this.instance.setState = jasmine.createSpy("setState");
    this.instance.getErrorScreen = jasmine.createSpy("getErrorScreen");
  });

  afterEach(function() {
    // Restore original functions
    MesosStateStore.get = this.storeGet;
    MesosStateStore.addChangeListener = this.storeChangeListener;
    TaskDirectoryStore.fetchDirectory = this.storeGetDirectory;
    TaskDirectoryStore.setPath = this.storeSetPath;

    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe("#componentDidMount", function() {
    it("calls fetchDirectory after onStateStoreSuccess is called", function() {
      this.instance.onStateStoreSuccess();
      expect(TaskDirectoryStore.fetchDirectory).toHaveBeenCalled();
    });
  });

  describe("#onTaskDirectoryStoreError", function() {
    it("increments taskDirectoryErrorCount state", function() {
      this.instance.state = { taskDirectoryErrorCount: 1 };
      this.instance.onTaskDirectoryStoreError();
      expect(this.instance.setState).toHaveBeenCalledWith({
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

      this.instance.onTaskDirectoryStoreSuccess("bar");
      expect(this.instance.setState).toHaveBeenCalledWith({
        directory,
        taskDirectoryErrorCount: 0
      });
    });
  });

  describe("#handleFetchDirectory", function() {
    it("calls TaskDirectoryStore.fetchDirectory", function() {
      this.instance.handleFetchDirectory();
      expect(TaskDirectoryStore.fetchDirectory).toHaveBeenCalled();
    });

    it("does not call TaskDirectoryStore.fetchDirectory", function() {
      MesosStateStore.getTaskFromTaskID = function() {
        return null;
      };
      this.instance.handleFetchDirectory();
      expect(TaskDirectoryStore.fetchDirectory).not.toHaveBeenCalled();
    });
  });

  describe("#handleBreadcrumbClick", function() {
    it("calls TaskDirectoryStore.setPath", function() {
      this.instance.handleBreadcrumbClick();
      expect(TaskDirectoryStore.setPath).toHaveBeenCalled();
    });

    it("does not call TaskDirectoryStore.setPath", function() {
      MesosStateStore.getTaskFromTaskID = function() {
        return null;
      };
      this.instance.handleBreadcrumbClick();
      expect(TaskDirectoryStore.setPath).not.toHaveBeenCalled();
    });
  });

  describe("#getSubView", function() {
    beforeEach(function() {
      this.getNodeFromID = MesosStateStore.getNodeFromID;
      MesosStateStore.getNodeFromID = function() {
        return { hostname: "hello" };
      };
      this.container = global.document.createElement("div");
    });

    afterEach(function() {
      MesosStateStore.getNodeFromID = this.getNodeFromID;

      ReactDOM.unmountComponentAtNode(this.container);
    });

    it("calls getErrorScreen when error occurred", function() {
      this.instance.state = {
        directory: new TaskDirectory({
          items: [{ nlink: 1, path: "/stdout" }]
        }),
        taskDirectoryErrorCount: 3
      };
      this.instance.getSubView();

      expect(this.instance.getErrorScreen).toHaveBeenCalled();
    });

    it("ignores getErrorScreen when error has not occurred", function() {
      // Let innerPath return something
      TaskDirectoryStore.get = jasmine
        .createSpy("TaskDirectoryStore#get")
        .and.returnValue("");
      this.instance.state = {
        directory: new TaskDirectory({ items: [{ nlink: 1, path: "/stdout" }] })
      };
      this.instance.getSubView();

      expect(this.instance.getErrorScreen).not.toHaveBeenCalled();
    });

    it("returns null if there are no nodes", function() {
      const node = ReactDOM.findDOMNode(this.instance);
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
          params: this.params,
          routes: [{ path: "/services/detail/:id/tasks/:taskID" }]
        },
        this.container,
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
      const result = this.instance.getBasicInfo();
      expect(result).toEqual(null);
    });

    it("returns an element if task is not null", function() {
      const result = this.instance.getBasicInfo();

      expect(TestUtils.isElement(result)).toEqual(true);
    });
  });
});
