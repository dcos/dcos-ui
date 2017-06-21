jest.dontMock("../TasksChart");
/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");
const TestUtils = require("react-addons-test-utils");

const TasksChart = require("../TasksChart");

describe("TasksChart", function() {
  describe("#getTaskInfo", function() {
    beforeEach(function() {
      this.container = global.document.createElement("div");
      this.instance = ReactDOM.render(
        <TasksChart tasks={{}} />,
        this.container
      );
    });

    afterEach(function() {
      ReactDOM.unmountComponentAtNode(this.container);
    });

    it("renders two task info labels when there is no data", function() {
      var rows = TestUtils.scryRenderedDOMComponentsWithClass(
        this.instance,
        "row"
      );
      var node = ReactDOM.findDOMNode(rows[rows.length - 1]);
      var taskLabels = node.querySelectorAll(".unit");
      expect(taskLabels.length).toEqual(2);
    });

    it("renders two task info labels when there is only data for one", function() {
      this.instance = ReactDOM.render(
        <TasksChart tasks={{ tasks: { TASK_RUNNING: 1 } }} />,
        this.container
      );
      var rows = TestUtils.scryRenderedDOMComponentsWithClass(
        this.instance,
        "row"
      );
      var node = ReactDOM.findDOMNode(rows[rows.length - 1]);
      var taskLabels = node.querySelectorAll(".unit");
      expect(taskLabels.length).toEqual(2);
    });
  });

  describe("#shouldComponentUpdate", function() {
    beforeEach(function() {
      this.tasks = { TASK_RUNNING: 0 };
      this.container = global.document.createElement("div");
      this.instance = ReactDOM.render(
        <TasksChart tasks={this.tasks} />,
        this.container
      );
    });

    afterEach(function() {
      ReactDOM.unmountComponentAtNode(this.container);
    });

    it("should allow update", function() {
      this.tasks.TASK_STAGING = 1;
      var shouldUpdate = this.instance.shouldComponentUpdate(this.tasks);
      expect(shouldUpdate).toEqual(true);
    });

    it("should not allow update", function() {
      var shouldUpdate = this.instance.shouldComponentUpdate(
        this.instance.props
      );
      expect(shouldUpdate).toEqual(false);
    });
  });

  describe("#getDialChartChildren", function() {
    beforeEach(function() {
      this.container = global.document.createElement("div");
      var parent = ReactDOM.render(<TasksChart tasks={{}} />, this.container);
      this.instance = ReactDOM.render(
        parent.getDialChartChildren(100),
        this.container
      );
    });

    afterEach(function() {
      ReactDOM.unmountComponentAtNode(this.container);
    });

    it("renders its unit", function() {
      var node = ReactDOM.findDOMNode(this.instance);
      var unit = node.querySelector(".unit");
      expect(unit.textContent).toEqual("100");
    });

    it("renders its label", function() {
      var node = ReactDOM.findDOMNode(this.instance);
      var label = node.querySelector(".unit-label");
      expect(label.textContent).toEqual("Total Tasks");
    });
  });
});
