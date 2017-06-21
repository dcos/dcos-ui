jest.dontMock("../HealthBar");
jest.dontMock("../../../../../../src/js/components/StatusBar");

/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");
const ReactTestUtils = require("react-addons-test-utils");
const Tooltip = require("reactjs-components").Tooltip;

const HealthBar = require("../HealthBar");
const StatusBar = require("../../../../../../src/js/components/StatusBar");

const testData = {
  tasksRunning: 3,
  tasksHealthy: 1,
  tasksUnhealthy: 1,
  tasksUnknown: 1,
  tasksStaged: 1
};

const testInstanceCount = 4;
describe("#HealthBar", function() {
  beforeEach(function() {
    this.container = global.document.createElement("div");
    this.instance = ReactDOM.render(
      <HealthBar tasksSummary={testData} instancesCount={testInstanceCount} />,
      this.container
    );
  });

  afterEach(function() {
    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe("PropTypes", function() {
    it("should throw an error if no tasks prop is provided", function() {
      spyOn(console, "error");
      this.instance = ReactDOM.render(<HealthBar />, this.container);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("StatusBar", function() {
    it("should contain StatusBar Component", function() {
      expect(
        ReactTestUtils.findRenderedComponentWithType(this.instance, StatusBar)
      ).toBeTruthy();
    });
  });

  describe("Tooltip", function() {
    it("should contain Tooltip Component", function() {
      expect(
        ReactTestUtils.findRenderedComponentWithType(this.instance, Tooltip)
      ).toBeTruthy();
    });
  });

  describe("Empty tooltip", function() {
    it("should have an empty tooltip", function() {
      this.instance = ReactDOM.render(
        <HealthBar tasksSummary={{}} />,
        this.container
      );

      expect(
        ReactTestUtils.findRenderedComponentWithType(this.instance, Tooltip)
          .props.content
      ).toEqual("No Running Tasks");
    });
  });

  describe("GetMappedTasksSummary", function() {
    it("should return a Mapped Array with all tasks", function() {
      const expectedOutput = [
        { className: "healthy", value: 1 },
        { className: "unhealthy", value: 1 },
        { className: "unknown", value: 1 },
        { className: "staged", value: 1 }
      ];
      expect(this.instance.getMappedTasksSummary(testData)).toEqual(
        expectedOutput
      );
    });

    it("should return a Mapped Array all values but some are 0", function() {
      const input = {
        tasksRunning: 4,
        tasksHealthy: 3,
        tasksUnhealthy: 1,
        tasksUnknown: 0,
        tasksStaged: 0
      };

      const expectedOutput = [
        { className: "healthy", value: 3 },
        { className: "unhealthy", value: 1 },
        { className: "unknown", value: 0 },
        { className: "staged", value: 0 }
      ];
      expect(this.instance.getMappedTasksSummary(input)).toEqual(
        expectedOutput
      );
    });

    it("should return a mapped array containing 0 values", function() {
      const input = {
        tasksRunning: 0,
        tasksHealthy: 0,
        tasksUnhealthy: 0,
        tasksUnknown: 0,
        tasksStaged: 0
      };

      const expectedOutput = [
        { className: "healthy", value: 0 },
        { className: "unhealthy", value: 0 },
        { className: "unknown", value: 0 },
        { className: "staged", value: 0 }
      ];
      expect(this.instance.getMappedTasksSummary(input)).toEqual(
        expectedOutput
      );
    });
  });

  describe("GetTaskList", function() {
    it("should return an array with 4 items", function() {
      expect(this.instance.getTaskList(testData).length).toEqual(4);
    });

    it("should return an array containing 2 items", function() {
      const input = {
        tasksRunning: 4,
        tasksHealthy: 3,
        tasksUnhealthy: 1,
        tasksUnknown: 0,
        tasksStaged: 0
      };

      expect(this.instance.getTaskList(input).length).toEqual(2);
    });

    it("should return an empty array", function() {
      const input = {
        tasksRunning: 0,
        tasksHealthy: 0,
        tasksUnhealthy: 0,
        tasksUnknown: 0,
        tasksStaged: 0
      };

      expect(this.instance.getTaskList(input).length).toEqual(0);
    });
  });
});
