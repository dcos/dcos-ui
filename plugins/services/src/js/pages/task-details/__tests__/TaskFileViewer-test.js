const JestUtil = require("#SRC/js/utils/JestUtil");

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
  describe("#getNewRoute", function() {
    let getNewRoute;
    beforeEach(function() {
      getNewRoute = TaskFileViewer.prototype.getNewRoute;
    });

    it("does not augment the path if there is a :filePath placeholder", function() {
      const params = {
        filePath: "%2Fvar%2Flib%2Fbar",
        id: "/data-services/kafka",
        taskID: "kafka-0-broker__d79a8dae-f0c4-48bd-a6c7-269856337fc9"
      };
      expect(
        getNewRoute(
          "/services/detail/:id/tasks/:taskID/files/view(/:filePath(/:innerPath))",
          params,
          "/var/lib/foo"
        )
      ).toBe(
        "/services/detail/%2Fdata-services%2Fkafka/tasks/kafka-0-broker__d79a8dae-f0c4-48bd-a6c7-269856337fc9/files/view/%252Fvar%252Flib%252Ffoo/%252Fvar%252Flib%252Ffoo"
      );
    });

    it("does augment the path without a / if there is no placeholder", function() {
      const params = {
        filePath: "%2Fvar%2Flib%2Fbar",
        id: "/data-services/kafka",
        taskID: "kafka-0-broker__d79a8dae-f0c4-48bd-a6c7-269856337fc9"
      };
      expect(
        getNewRoute(
          "/services/detail/:id/tasks/:taskID/files/view",
          params,
          "/var/lib/foo"
        )
      ).toBe(
        "/services/detail/%2Fdata-services%2Fkafka/tasks/kafka-0-broker__d79a8dae-f0c4-48bd-a6c7-269856337fc9/files/view/%252Fvar%252Flib%252Ffoo"
      );
    });

    it("does augment the path with a / if there is no placeholder and no /", function() {
      it("does augment the path without a / if there is no placeholder", function() {
        const params = {
          filePath: "%2Fvar%2Flib%2Fbar",
          id: "/data-services/kafka",
          taskID: "kafka-0-broker__d79a8dae-f0c4-48bd-a6c7-269856337fc9"
        };
        expect(
          getNewRoute(
            "/services/detail/:id/tasks/:taskID/files/view/",
            params,
            "/var/lib/foo"
          )
        ).toBe(
          "/services/detail/%2Fdata-services%2Fkafka/tasks/kafka-0-broker__d79a8dae-f0c4-48bd-a6c7-269856337fc9/files/view/%252Fvar%252Flib%252Ffoo"
        );
      });
    });
  });

  describe("#render", function() {
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
    it("sets button disabled when file is not found", function() {
      this.instance = ReactDOM.render(
        <TaskFileViewer
          directory={new TaskDirectory({ items: [{ nlink: 1, path: "" }] })}
          params={{ filePath: "undefined" }}
          task={{ slave_id: "foo" }}
        />,
        this.container
      );
      const btn = this.container.querySelector("a.button.button-primary-link");
      // If btn.props.disabled = true, then disabled attribute will return an object.
      // If btn.props.disabled = false, then disabled attribute will be undefined.
      // So here we just test to see if attribute exists
      expect(btn.attributes.disabled).toBeTruthy();
    });

    it("sets button not disabled when file is found", function() {
      const btn = this.container.querySelector("a.button.button-primary-link");
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
