/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");
const TestUtils = require("react-addons-test-utils");

const TasksChart = require("../TasksChart");

let thisContainer, thisInstance, thisTasks;

describe("TasksChart", function() {
  describe("#getTaskInfo", function() {
    beforeEach(function() {
      thisContainer = global.document.createElement("div");
      thisInstance = ReactDOM.render(<TasksChart tasks={{}} />, thisContainer);
    });

    afterEach(function() {
      ReactDOM.unmountComponentAtNode(thisContainer);
    });

    it("renders two task info labels when there is no data", function() {
      var rows = TestUtils.scryRenderedDOMComponentsWithClass(
        thisInstance,
        "row"
      );
      var node = ReactDOM.findDOMNode(rows[rows.length - 1]);
      var taskLabels = node.querySelectorAll(".unit");
      expect(taskLabels.length).toEqual(2);
    });

    it("renders two task info labels when there is only data for one", function() {
      thisInstance = ReactDOM.render(
        <TasksChart tasks={{ tasks: { TASK_RUNNING: 1 } }} />,
        thisContainer
      );
      var rows = TestUtils.scryRenderedDOMComponentsWithClass(
        thisInstance,
        "row"
      );
      var node = ReactDOM.findDOMNode(rows[rows.length - 1]);
      var taskLabels = node.querySelectorAll(".unit");
      expect(taskLabels.length).toEqual(2);
    });
  });

  describe("#shouldComponentUpdate", function() {
    beforeEach(function() {
      thisTasks = { TASK_RUNNING: 0 };
      thisContainer = global.document.createElement("div");
      thisInstance = ReactDOM.render(
        <TasksChart tasks={thisTasks} />,
        thisContainer
      );
    });

    afterEach(function() {
      ReactDOM.unmountComponentAtNode(thisContainer);
    });

    it("allows update", function() {
      thisTasks.TASK_STAGING = 1;
      var shouldUpdate = thisInstance.shouldComponentUpdate(thisTasks);
      expect(shouldUpdate).toEqual(true);
    });

    it("does not allow update", function() {
      var shouldUpdate = thisInstance.shouldComponentUpdate(thisInstance.props);
      expect(shouldUpdate).toEqual(false);
    });
  });

  describe("#getDialChartChildren", function() {
    beforeEach(function() {
      thisContainer = global.document.createElement("div");
      var parent = ReactDOM.render(<TasksChart tasks={{}} />, thisContainer);
      thisInstance = ReactDOM.render(
        parent.getDialChartChildren(100),
        thisContainer
      );
    });

    afterEach(function() {
      ReactDOM.unmountComponentAtNode(thisContainer);
    });

    it("renders its unit", function() {
      var node = ReactDOM.findDOMNode(thisInstance);
      var unit = node.querySelector(".unit");
      expect(unit.textContent).toEqual("100");
    });

    it("renders its label", function() {
      var node = ReactDOM.findDOMNode(thisInstance);
      var label = node.querySelector(".unit-label");
      expect(label.textContent).toEqual("Total Tasks");
    });
  });
});
