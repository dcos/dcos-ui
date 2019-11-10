import React from "react";
import { I18nProvider } from "@lingui/react";
import { mount, shallow } from "enzyme";

const TasksChart = require("../TasksChart");

let thisInstance, thisTasks;

describe("TasksChart", () => {
  describe("#render", () => {
    beforeEach(() => {
      thisInstance = mount(
        <I18nProvider defaultRender="span">
          <TasksChart tasks={{}} />
        </I18nProvider>
      );
    });

    it("renders its label", () => {
      expect(
        thisInstance
          .render()
          .find(".description .unit-label")
          .text()
      ).toEqual("Total Tasks");
    });
  });

  describe("#getTaskInfo", () => {
    beforeEach(() => {
      thisInstance = shallow(<TasksChart tasks={{}} />);
    });

    it("renders two task info labels when there is no data", () => {
      const taskLabels = thisInstance
        .find(".row")
        .last()
        .find(".unit");
      expect(taskLabels.length).toEqual(2);
    });

    it("renders two task info labels when there is only data for one", () => {
      thisInstance = shallow(
        <TasksChart tasks={{ tasks: { TASK_RUNNING: 1 } }} />
      );

      const taskLabels = thisInstance
        .find(".row")
        .last()
        .find(".unit");
      expect(taskLabels.length).toEqual(2);
    });
  });

  describe("#shouldComponentUpdate", () => {
    beforeEach(() => {
      thisTasks = { TASK_RUNNING: 0 };
      thisInstance = shallow(<TasksChart tasks={thisTasks} />);
    });

    it("allows update", () => {
      thisTasks.TASK_STAGING = 1;
      var shouldUpdate = thisInstance
        .instance()
        .shouldComponentUpdate(thisTasks);
      expect(shouldUpdate).toEqual(true);
    });

    it("does not allow update", () => {
      var shouldUpdate = thisInstance
        .instance()
        .shouldComponentUpdate(thisInstance.instance().props);
      expect(shouldUpdate).toEqual(false);
    });
  });

  describe("#getDialChartChildren", () => {
    beforeEach(() => {
      var parent = shallow(<TasksChart tasks={{}} />);
      thisInstance = shallow(parent.instance().getDialChartChildren(100));
    });

    it("renders its unit", () => {
      expect(thisInstance.find(".unit").text()).toEqual("100");
    });
  });
});
