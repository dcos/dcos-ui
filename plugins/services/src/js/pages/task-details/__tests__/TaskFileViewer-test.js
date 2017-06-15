jest.dontMock("../../../../../../../src/js/components/Icon");
jest.dontMock("../../../components/MesosLogContainer");
jest.dontMock("../../../../../../../src/js/components/RequestErrorMsg");
jest.dontMock("../TaskFileViewer");
jest.dontMock("../../../../../../../src/js/components/FilterBar");

const JestUtil = require("../../../../../../../src/js/utils/JestUtil");

JestUtil.unMockStores(["TaskDirectoryStore", "MesosLogStore"]);

const DirectoryItem = require("../../../structs/DirectoryItem");
const TaskDirectory = require("../../../structs/TaskDirectory");
/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");

const TaskDirectoryActions = require("../../../events/TaskDirectoryActions");
const TaskFileViewer = require("../TaskFileViewer");

describe("TaskFileViewer", function() {
  beforeEach(function() {
    this.container = global.document.createElement("div");
    this.instance = ReactDOM.render(
      <TaskFileViewer
        directory={
          new TaskDirectory({ items: [{ nlink: 1, path: "/stdout" }] })
        }
        params={{ filePath: "undefined" }}
        selectedLogFile={new DirectoryItem({ nlink: 1, path: "/stdout" })}
        task={{ slave_id: "foo" }}
      />,
      this.container
    );
  });

  afterEach(function() {
    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe("#render", function() {
    it("should set button disabled when file is not found", function() {
      this.instance = ReactDOM.render(
        <TaskFileViewer
          directory={new TaskDirectory({ items: [{ nlink: 1, path: "" }] })}
          params={{ filePath: "undefined" }}
          task={{ slave_id: "foo" }}
        />,
        this.container
      );
      const btn = this.container.querySelector("a.button.button-stroke");
      // If btn.props.disabled = true, then disabled attribute will return an object.
      // If btn.props.disabled = false, then disabled attribute will be undefined.
      // So here we just test to see if attribute exists
      expect(btn.attributes.disabled).toBeTruthy();
    });

    it("should set button not disabled when file is found", function() {
      const btn = this.container.querySelector("a.button.button-stroke");
      // If btn.props.disabled = false, then disabled attribute will be undefined
      expect(btn.attributes.disabled).toEqual(undefined);
    });

    it("renders stdout on first render", function() {
      this.instance.state = { currentView: 0 };
      TaskDirectoryActions.getDownloadURL = jasmine.createSpy(
        "TaskDirectoryActions#getDownloadURL"
      );

      this.instance.render();

      expect(TaskDirectoryActions.getDownloadURL).toHaveBeenCalledWith(
        "foo",
        "/stdout"
      );
    });

    it("renders stderr when view is changed", function() {
      this.instance = ReactDOM.render(
        <TaskFileViewer
          directory={
            new TaskDirectory({
              items: [
                { nlink: 1, path: "/stdout" },
                { nlink: 1, path: "/stderr" }
              ]
            })
          }
          params={{ filePath: "/stderr" }}
          selectedLogFile={new DirectoryItem({ nlink: 1, path: "/stderr" })}
          task={{ slave_id: "foo" }}
        />,
        this.container
      );

      // Setup spy after state has been configured
      TaskDirectoryActions.getDownloadURL = jasmine.createSpy(
        "TaskDirectoryActions#getDownloadURL"
      );

      this.instance.render();

      expect(TaskDirectoryActions.getDownloadURL).toHaveBeenCalledWith(
        "foo",
        "/stderr"
      );
    });

    it("limits files to stdout and stderr when provided", function() {
      this.instance = ReactDOM.render(
        <TaskFileViewer
          directory={
            new TaskDirectory({
              items: [
                { nlink: 1, path: "/foo" },
                { nlink: 1, path: "/stdout" },
                { nlink: 1, path: "/stderr" }
              ]
            })
          }
          params={{}}
          limitLogFiles={["stdout", "stderr"]}
          task={{ slave_id: "foo" }}
        />,
        this.container
      );

      expect(this.instance.getLogFiles()).toEqual([
        new DirectoryItem({ nlink: 1, path: "/stdout" }),
        new DirectoryItem({ nlink: 1, path: "/stderr" })
      ]);
    });

    it("includes all files when limit is not provided", function() {
      this.instance = ReactDOM.render(
        <TaskFileViewer
          directory={
            new TaskDirectory({
              items: [
                { nlink: 1, path: "/foo" },
                { nlink: 1, path: "/stdout" },
                { nlink: 1, path: "/stderr" }
              ]
            })
          }
          params={{}}
          task={{ slave_id: "foo" }}
        />,
        this.container
      );

      expect(this.instance.getLogFiles()).toEqual([
        new DirectoryItem({ nlink: 1, path: "/foo" }),
        new DirectoryItem({ nlink: 1, path: "/stdout" }),
        new DirectoryItem({ nlink: 1, path: "/stderr" })
      ]);
    });
  });
});
