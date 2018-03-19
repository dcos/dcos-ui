import React from "react";
import { shallow } from "enzyme";

const TasksChart = require("../TasksChart");

let thisInstance, thisTasks;

describe("TasksChart", function() {
  describe("#getTaskInfo", function() {
    beforeEach(function() {
      thisInstance = shallow(<TasksChart tasks={{}} />);
    });

    it("renders two task info labels when there is no data", function() {
      const taskLabels = thisInstance.find(".row").last().find(".unit");
      expect(taskLabels.length).toEqual(2);
    });

    it("renders two task info labels when there is only data for one", function() {
      thisInstance = shallow(
        <TasksChart tasks={{ tasks: { TASK_RUNNING: 1 } }} />
      );

      const taskLabels = thisInstance.find(".row").last().find(".unit");
      expect(taskLabels.length).toEqual(2);
    });
  });

  describe("#shouldComponentUpdate", function() {
    beforeEach(function() {
      thisTasks = { TASK_RUNNING: 0 };
      thisInstance = shallow(<TasksChart tasks={thisTasks} />);
    });

    it("allows update", function() {
      thisTasks.TASK_STAGING = 1;
      var shouldUpdate = thisInstance
        .instance()
        .shouldComponentUpdate(thisTasks);
      expect(shouldUpdate).toEqual(true);
    });

    it("does not allow update", function() {
      var shouldUpdate = thisInstance
        .instance()
        .shouldComponentUpdate(thisInstance.instance().props);
      expect(shouldUpdate).toEqual(false);
    });
  });

  describe("#getDialChartChildren", function() {
    beforeEach(function() {
      var parent = shallow(<TasksChart tasks={{}} />);
      thisInstance = shallow(parent.instance().getDialChartChildren(100));
    });

    it("renders its unit", function() {
      expect(thisInstance.find(".unit").text()).toEqual("100");
    });

    it("renders its label", function() {
      expect(thisInstance.find(".unit-label").text()).toEqual("Total Tasks");
    });
  });
});
