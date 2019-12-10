jest.mock("#SRC/js/stores/MetadataStore");
jest.mock("#SRC/js/stores/MesosStateStore");
jest.mock("#SRC/js/utils/RouterUtil", () => ({
  reconstructPathFromRoutes: jest.fn()
}));
jest.mock("react-router");

const Task = require("../../../structs/Task").default;
const TaskDirectory = require("../../../structs/TaskDirectory").default;
const TaskDirectoryStore = require("../../../stores/TaskDirectoryStore")
  .default;
const TaskDetail = require("../TaskDetail").default;
/* eslint-enable */

const MesosStateStore = require("#SRC/js/stores/MesosStateStore");

let thisStoreGetDirectory,
  thisStoreSetPath,
  thisStoreGet,
  thisStoreChangeListener,
  thisParams;

let mockThis;

describe("TaskDetail", () => {
  beforeEach(() => {
    // Store original versions
    thisStoreGetDirectory = TaskDirectoryStore.fetchDirectory;
    thisStoreSetPath = TaskDirectoryStore.setPath;
    thisStoreGet = MesosStateStore.get;
    thisStoreChangeListener = MesosStateStore.addChangeListener;

    // Create mock functions
    MesosStateStore.get = key => {
      if (key === "lastMesosState") {
        return {};
      }
    };
    MesosStateStore.addChangeListener = () => {};
    MesosStateStore.getTaskFromTaskID = () =>
      new Task({
        id: "bar",
        state: "TASK_RUNNING"
      });

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

  afterEach(() => {
    // Restore original functions
    MesosStateStore.get = thisStoreGet;
    MesosStateStore.addChangeListener = thisStoreChangeListener;
    TaskDirectoryStore.fetchDirectory = thisStoreGetDirectory;
    TaskDirectoryStore.setPath = thisStoreSetPath;
  });

  describe("#componentDidMount", () => {
    it("calls fetchDirectory after onStateStoreSuccess is called", () => {
      TaskDetail.prototype.onStateStoreSuccess.call(mockThis);
      expect(mockThis.handleFetchDirectory).toHaveBeenCalled();
    });
  });

  describe("#onTaskDirectoryStoreError", () => {
    it("increments taskDirectoryErrorCount state", () => {
      mockThis.state = { taskDirectoryErrorCount: 1 };
      TaskDetail.prototype.onTaskDirectoryStoreError.call(mockThis);
      expect(mockThis.setState).toHaveBeenCalledWith({
        taskDirectoryErrorCount: 2
      });
    });
  });

  describe("#onTaskDirectoryStoreSuccess", () => {
    it("increments onTaskDirectoryStoreSuccess state", () => {
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

  describe("#handleFetchDirectory", () => {
    it("calls TaskDirectoryStore.fetchDirectory", () => {
      delete mockThis.handleFetchDirectory;
      TaskDetail.prototype.handleFetchDirectory.call(mockThis);
      expect(TaskDirectoryStore.fetchDirectory).toHaveBeenCalled();
    });

    it("does not call TaskDirectoryStore.fetchDirectory", () => {
      MesosStateStore.getTaskFromTaskID = () => null;
      TaskDetail.prototype.handleFetchDirectory.call(mockThis);
      expect(TaskDirectoryStore.fetchDirectory).not.toHaveBeenCalled();
    });
  });

  describe("#handleBreadcrumbClick", () => {
    it("calls TaskDirectoryStore.setPath", () => {
      TaskDetail.prototype.handleBreadcrumbClick.call(mockThis);
      expect(TaskDirectoryStore.setPath).toHaveBeenCalled();
    });

    it("does not call TaskDirectoryStore.setPath", () => {
      MesosStateStore.getTaskFromTaskID = () => null;
      TaskDetail.prototype.handleBreadcrumbClick.call(mockThis);
      expect(TaskDirectoryStore.setPath).not.toHaveBeenCalled();
    });
  });

  describe("#getSubView", () => {
    it("calls getErrorScreen when error occurred", () => {
      const mockGetErrorScreen = jest.fn();
      TaskDetail.prototype.getSubView.call({
        ...mockThis,
        getErrorScreen: mockGetErrorScreen,
        hasLoadingError: jest.fn(() => true)
      });

      expect(mockGetErrorScreen).toHaveBeenCalled();
    });

    it("ignores getErrorScreen when error has not occurred", () => {
      const mockGetErrorScreen = jest.fn();
      TaskDetail.prototype.getSubView.call({
        ...mockThis,
        getErrorScreen: mockGetErrorScreen,
        hasLoadingError: jest.fn(() => false)
      });

      expect(mockGetErrorScreen).not.toHaveBeenCalled();
    });

    it("returns an element if there is a node", () => {
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

  describe("#getBasicInfo", () => {
    it("returns null if task is null", () => {
      MesosStateStore.getTaskFromTaskID = () => null;

      expect(TaskDetail.prototype.getBasicInfo.call(mockThis)).toEqual(null);
    });

    it("returns an element if task is not null", () => {
      expect(TaskDetail.prototype.getBasicInfo.call(mockThis)).not.toEqual(
        null
      );
    });
  });
});
