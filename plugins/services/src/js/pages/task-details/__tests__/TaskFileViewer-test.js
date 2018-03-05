import React from "react";
import ReactDOM from "react-dom";

import DirectoryItem from "../../../structs/DirectoryItem";
import TaskDirectory from "../../../structs/TaskDirectory";

import TaskDirectoryActions from "../../../events/TaskDirectoryActions";
import TaskFileViewer from "../TaskFileViewer";

let thisContainer, thisInstance;

describe("TaskFileViewer", function() {
  beforeEach(function() {
    thisContainer = global.document.createElement("div");
    thisInstance = ReactDOM.render(
      <TaskFileViewer
        directory={
          new TaskDirectory({ items: [{ nlink: 1, path: "/stdout" }] })
        }
        params={{ filePath: "undefined" }}
        selectedLogFile={new DirectoryItem({ nlink: 1, path: "/stdout" })}
        task={{ slave_id: "foo" }}
      />,
      thisContainer
    );
  });

  afterEach(function() {
    ReactDOM.unmountComponentAtNode(thisContainer);
  });

  describe("#render", function() {
    beforeEach(function() {
      thisContainer = global.document.createElement("div");
      this.instance = ReactDOM.render(
        <TaskFileViewer
          directory={
            new TaskDirectory({ items: [{ nlink: 1, path: "/stdout" }] })
          }
          params={{ filePath: "undefined" }}
          selectedLogFile={new DirectoryItem({ nlink: 1, path: "/stdout" })}
          task={{ slave_id: "foo" }}
        />,
        thisContainer
      );
    });

    afterEach(function() {
      ReactDOM.unmountComponentAtNode(thisContainer);
    });
    it("sets button disabled when file is not found", function() {
      thisInstance = ReactDOM.render(
        <TaskFileViewer
          directory={new TaskDirectory({ items: [{ nlink: 1, path: "" }] })}
          params={{ filePath: "undefined" }}
          task={{ slave_id: "foo" }}
        />,
        thisContainer
      );
      const btn = thisContainer.querySelector("a.button.button-primary-link");
      // If btn.props.disabled = true, then disabled attribute will return an object.
      // If btn.props.disabled = false, then disabled attribute will be undefined.
      // So here we just test to see if attribute exists
      expect(btn.attributes.disabled).toBeTruthy();
    });

    it("sets button not disabled when file is found", function() {
      const btn = thisContainer.querySelector("a.button.button-primary-link");
      // If btn.props.disabled = false, then disabled attribute will be undefined
      expect(btn.attributes.disabled).toEqual(undefined);
    });

    it("renders stdout on first render", function() {
      thisInstance.state = { currentView: 0 };
      TaskDirectoryActions.getDownloadURL = jasmine.createSpy(
        "TaskDirectoryActions#getDownloadURL"
      );

      thisInstance.render();

      expect(TaskDirectoryActions.getDownloadURL).toHaveBeenCalledWith(
        "foo",
        "/stdout"
      );
    });

    it("renders stderr when view is changed", function() {
      thisInstance = ReactDOM.render(
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
        thisContainer
      );

      // Setup spy after state has been configured
      TaskDirectoryActions.getDownloadURL = jasmine.createSpy(
        "TaskDirectoryActions#getDownloadURL"
      );

      thisInstance.render();

      expect(TaskDirectoryActions.getDownloadURL).toHaveBeenCalledWith(
        "foo",
        "/stderr"
      );
    });

    it("limits files to stdout and stderr when provided", function() {
      thisInstance = ReactDOM.render(
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
        thisContainer
      );

      expect(thisInstance.getLogFiles()).toEqual([
        new DirectoryItem({ nlink: 1, path: "/stdout" }),
        new DirectoryItem({ nlink: 1, path: "/stderr" })
      ]);
    });

    it("includes all files when limit is not provided", function() {
      thisInstance = ReactDOM.render(
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
        thisContainer
      );

      expect(thisInstance.getLogFiles()).toEqual([
        new DirectoryItem({ nlink: 1, path: "/foo" }),
        new DirectoryItem({ nlink: 1, path: "/stdout" }),
        new DirectoryItem({ nlink: 1, path: "/stderr" })
      ]);
    });
  });
});
