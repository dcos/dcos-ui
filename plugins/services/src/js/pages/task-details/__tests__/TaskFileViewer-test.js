import React from "react";
import ReactDOM from "react-dom";
import JestUtil from "#SRC/js/utils/JestUtil";
import { mount } from "enzyme";
import { Dropdown } from "reactjs-components";

import DirectoryItem from "../../../structs/DirectoryItem";
import TaskDirectory from "../../../structs/TaskDirectory";

import TaskFileViewer from "../TaskFileViewer";

let thisContainer, thisInstance;

describe("TaskFileViewer", function() {
  beforeEach(function() {
    thisContainer = global.document.createElement("div");
    const WrappedComponent = JestUtil.withI18nProvider(TaskFileViewer);
    thisInstance = mount(
      <WrappedComponent
        directory={
          new TaskDirectory({ items: [{ nlink: 1, path: "/stdout" }] })
        }
        params={{ filePath: "undefined" }}
        selectedLogFile={new DirectoryItem({ nlink: 1, path: "/stdout" })}
        task={{ slave_id: "foo" }}
      />
    );
  });

  afterEach(function() {
    ReactDOM.unmountComponentAtNode(thisContainer);
  });

  describe("#render", function() {
    beforeEach(function() {
      thisContainer = global.document.createElement("div");
      const WrappedComponent = JestUtil.withI18nProvider(TaskFileViewer);
      this.instance = mount(
        <WrappedComponent
          directory={
            new TaskDirectory({ items: [{ nlink: 1, path: "/stdout" }] })
          }
          params={{ filePath: "undefined" }}
          selectedLogFile={new DirectoryItem({ nlink: 1, path: "/stdout" })}
          task={{ slave_id: "foo" }}
        />
      );
    });

    afterEach(function() {
      ReactDOM.unmountComponentAtNode(thisContainer);
    });
    it("sets button disabled when file is not found", function() {
      const WrappedComponent = JestUtil.withI18nProvider(TaskFileViewer);
      thisInstance = mount(
        <WrappedComponent
          directory={new TaskDirectory({ items: [{ nlink: 1, path: "" }] })}
          params={{ filePath: "undefined" }}
          task={{ slave_id: "foo" }}
        />
      );
      const btn = thisInstance.find("a.button.button-primary-link");
      expect(btn.prop("disabled")).toBeTruthy();
    });

    it("sets button not disabled when file is found", function() {
      const btn = thisInstance.find("a.button.button-primary-link");
      expect(btn.prop("disabled")).toEqual(false);
    });

    it("renders stderr when view is changed", function() {
      const WrappedComponent = JestUtil.withI18nProvider(TaskFileViewer);
      thisInstance = mount(
        <WrappedComponent
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
        />
      );

      const activeButton = thisInstance.find(".button.button-outline.active");
      expect(activeButton.text()).toContain("stderr");
    });

    it("limits files to stdout and stderr when provided", function() {
      const WrappedComponent = JestUtil.withI18nProvider(TaskFileViewer);
      thisInstance = mount(
        <WrappedComponent
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
        />
      );

      const files = thisInstance.find(
        ".filter-bar-right .button.button-outline"
      );

      expect(files).toHaveLength(2);
    });

    it("includes all files when limit is not provided", function() {
      const WrappedComponent = JestUtil.withI18nProvider(TaskFileViewer);
      thisInstance = mount(
        <WrappedComponent
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
        />
      );

      const dropdown = thisInstance.find(Dropdown);

      expect(dropdown.props().items).toHaveLength(3);
    });
  });
});
