jest.dontMock("foundation-ui");
jest.dontMock("foundation-ui/stores/DCOSStore");
jest.dontMock("../TaskFilesTab");
jest.dontMock("../TaskDetail");
jest.dontMock("../../../stores/MarathonStore");
jest.dontMock("../../../../../../../src/js/stores/MesosStateStore");
jest.dontMock("../../../../../../../src/js/stores/MesosSummaryStore");
jest.dontMock("../../../../../../../src/js/components/Page");
jest.dontMock("../../../../../../../src/js/mixins/InternalStorageMixin");

const JestUtil = require("../../../../../../../src/js/utils/JestUtil");

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
const MesosSummaryStore = require("../../../../../../../src/js/stores/MesosSummaryStore");
/* eslint-enable no-unused-vars */
const MesosStateStore = require("../../../../../../../src/js/stores/MesosStateStore");
const Task = require("../../../structs/Task");
const TaskDirectory = require("../../../structs/TaskDirectory");
const TaskDirectoryStore = require("../../../stores/TaskDirectoryStore");
const TaskDetail = require("../TaskDetail");

describe("TaskDetail", function() {
  beforeEach(function() {
    this.container = global.document.createElement("div");
    this.params = {};
    this.instance = JestUtil.renderWithStubbedRouter(
      TaskDetail,
      {
        params: this.params,
        routes: [{ path: "/services/overview/:id/tasks/:taskID" }]
      },
      this.container,
      {}
    );
    this.instance.setState = jasmine.createSpy("setState");
    this.instance.getErrorScreen = jasmine.createSpy("getErrorScreen");
    // Store original versions
    this.storeGetDirectory = TaskDirectoryStore.fetchDirectory;
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
        id: "fake id",
        state: "TASK_RUNNING"
      });
    };

    TaskDirectoryStore.fetchDirectory = jasmine.createSpy("getDirectory");
  });

  afterEach(function() {
    // Restore original functions
    MesosStateStore.get = this.storeGet;
    MesosStateStore.addChangeListener = this.storeChangeListener;
    TaskDirectoryStore.fetchDirectory = this.storeGetDirectory;

    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe("#componentDidMount", function() {
    it("should call getDirectory after onStateStoreSuccess is called", function() {
      this.instance.onStateStoreSuccess();
      expect(TaskDirectoryStore.fetchDirectory).toHaveBeenCalled();
    });
  });

  describe("#onTaskDirectoryStoreError", function() {
    it("should setState", function() {
      this.instance.onTaskDirectoryStoreError();
      expect(this.instance.setState).toHaveBeenCalled();
    });

    it("should setState increment taskDirectoryErrorCount", function() {
      this.instance.state = { taskDirectoryErrorCount: 1 };
      this.instance.onTaskDirectoryStoreError();
      expect(this.instance.setState).toHaveBeenCalledWith({
        taskDirectoryErrorCount: 2
      });
    });
  });

  describe("#onTaskDirectoryStoreSuccess", function() {
    it("should setState", function() {
      this.instance.onTaskDirectoryStoreSuccess();
      expect(this.instance.setState).toHaveBeenCalled();
    });

    it("should setState increment onTaskDirectoryStoreSuccess", function() {
      const directory = new TaskDirectory({
        items: [{ nlink: 1, path: "/stdout" }]
      });
      // Let directory return something
      TaskDirectoryStore.get = jasmine
        .createSpy("TaskDirectoryStore#get")
        .and.returnValue(directory);

      this.instance.onTaskDirectoryStoreSuccess();
      expect(this.instance.setState).toHaveBeenCalledWith({
        directory,
        taskDirectoryErrorCount: 0
      });
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

    it("should call getErrorScreen when error occurred", function() {
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

    it("should return null if there are no nodes", function() {
      const node = ReactDOM.findDOMNode(this.instance);
      expect(node).toEqual(null);
    });

    it("should return an element if there is a node", function() {
      MesosStateStore.get = function() {
        return new Task({
          slaves: { fakeProp: "faked" }
        });
      };

      const instance = JestUtil.renderWithStubbedRouter(
        TaskDetail,
        {
          params: this.params,
          routes: [{ path: "/services/overview/:id/tasks/:taskID" }]
        },
        this.container,
        {}
      );

      const node = ReactDOM.findDOMNode(instance);
      expect(TestUtils.isDOMComponent(node)).toEqual(true);
    });
  });

  describe("#getBasicInfo", function() {
    it("should return null if task is null", function() {
      MesosStateStore.getTaskFromTaskID = function() {
        return null;
      };
      const result = this.instance.getBasicInfo();
      expect(result).toEqual(null);
    });

    it("should return an element if task is not null", function() {
      const result = this.instance.getBasicInfo();

      expect(TestUtils.isElement(result)).toEqual(true);
    });
  });
});
